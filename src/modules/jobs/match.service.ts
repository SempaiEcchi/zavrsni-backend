import {BadRequestException, Injectable, UnauthorizedException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, Repository} from "typeorm";
import {getJobRelations, JobOpportunityEntity} from "../../models/jobOpportunities.entity.js";
import {SwipeDirection,} from "../../models/jobSwipes.entity.js";
import {MatchEntity} from "../../models/match.entity.js";
import {AppliedApplicant, RecommendedApplicant, SimpleStudent, StudentEntity} from "../../models/students.entity.js";
import {EmploymentRecordEntity} from "../../models/employmentRecord.entity.js";
import {ChatService} from "../../chat/chat.service.js";
import {UserService} from "../users/user.service.js";
import {NotificationsService} from "../notifications/notifications.service.js";
import {UserEntity} from "../../models/user.entity.js";
import {MatchWithCompanyNotification} from "../notifications/firmus.notification.js";
import {JobsService} from "./jobs.service.js";
import {JobApplicationEntity} from "../../models/jobApplication.entity.js";
import {CompanyEntity} from "../../models/company.entity.js";
import logger from "../../logger.js";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(JobOpportunityEntity)
        private jobOpportunitiesRepository: Repository<JobOpportunityEntity>,
        @InjectRepository(JobApplicationEntity)
        private jobApplicationRepository: Repository<JobApplicationEntity>,
        @InjectRepository(MatchEntity)
        private matchEntityRepository: Repository<MatchEntity>,
        @InjectRepository(StudentEntity)
        private studentEntityRepository: Repository<StudentEntity>,
        @InjectRepository(EmploymentRecordEntity)
        private employmentRecordRepository: Repository<EmploymentRecordEntity>,
        private chatService: ChatService,
        private userService: UserService,
        private jobService: JobsService,
        private notificationService: NotificationsService,
    ) {
    }


    async getStudentJobs(
        student_id: number,
    ) {

        // Execute the queries concurrently
        const [applications, matchedJobs, activeJobs] = await Promise.all([
            this.jobApplicationRepository.find({
                where: {
                    student_id: student_id,
                },
                relations: getJobRelations("job_opportunity"),
            }),
            this.matchEntityRepository.find({
                where: {
                    student_id: student_id,
                    job_started: false,
                },
                relations: getJobRelations("job_opportunity"),
            }),
            this.employmentRecordRepository.find({
                where: {
                    student_id: student_id,
                },
                relations: getJobRelations("match.job_opportunity"),
            })
        ]);


        return {
            saved_jobs: applications.filter((x) => x.student_swipe_direction === SwipeDirection.SAVE).map((x) => x.job_opportunity),
            applied_jobs: applications.filter((x) => x.student_swipe_direction === SwipeDirection.LIKE && x.company_swipe_direction != SwipeDirection.LIKE).map((x) => ({
                ...x.job_opportunity,
                is_rejected: x.company_swipe_direction === SwipeDirection.DISLIKE,
            })),
            matched_jobs: matchedJobs.filter((x) => x.job_started === false).map((x) => ({
                ...x.job_opportunity,
                match_id: x.application_id,
                is_rejected: x.is_rejected,
            })),
            active_jobs: activeJobs.map((x) => ({
                ...x.match.job_opportunity,
                completion_date: x.completion_date,
                started_date: x.created_at,
            })),
        }

    }


    async getMatchedJobs(student_id: number) {
        const matches = await this.matchEntityRepository.find({
            where: {
                student_id: student_id,
                application_id: IsNull(),
            },
            relations: getJobRelations("job_opportunity"),
        });
        return matches.map((match) => {
            return {
                ...match.job_opportunity,
                match_id: match.application_id,
            };
        });
    }


    async acceptMatch(id: string, user: UserEntity) {
        const match = await this.matchEntityRepository.findOne({
            where: {application_id: +id},
            relations: ["student", "job_opportunity", "job_opportunity.company"],
        });

        if (!match) throw new BadRequestException("Match not found");

        if (
            match.student.user_id != user.firebase_uid &&
            match.job_opportunity.company.user_id != user.firebase_uid
        )
            throw new UnauthorizedException("Unauthorized");


    }

    async cancelMatch(id: string, user: UserEntity) {
        const match = await this.matchEntityRepository.findOne({
            where: {application_id: +id},
            relations: ["student", "job_opportunity", "job_opportunity.company"],
        });

        if (!match) throw new BadRequestException("Match not found");

        if (
            match.student.user_id != user.firebase_uid &&
            match.job_opportunity.company.user_id != user.firebase_uid
        )
            throw new UnauthorizedException("Unauthorized");


        return {};
    }

    async startJob(match_id: string) {
        const match = await this.getMatch(match_id)
        const record = new EmploymentRecordEntity();

        record.match_id = +match_id;
        record.company_id = match.job_opportunity.company.id;
        record.student_id = match.student.id;

        match.job_started = true;
        await match.save();

        await record.save();

        return {
            employment_id: match_id,
        };

    }

    async rejectStudent(match_id: string) {
        const match = await this.getMatch(match_id);
        match.is_rejected = true;
        await match.save();

        return {};

    }

    async getMatch(id: string) {
        const match = await this.matchEntityRepository.findOne({
            where: {application_id: +id},
            relations: ["student", "student.studentVideoCVs", "student.profile_picture", ...getJobRelations("job_opportunity")],
        });

        if (!match) throw new BadRequestException("Match not found");

        return match;
    }

    async getMatchDetails(id: string, user_id) {
        const match = await this.getMatch(id);

        // if (
        //   match.student.user_id !== user_id ||
        //   match.job_opportunity.company.user_id !== user_id
        // ) {
        //   throw new UnauthorizedException("Unauthorized");
        // }

        return {
            match_id: match.application_id,
            student: match.student,
            job_opportunity: match.job_opportunity,
            chat_id: match.chat_id,
        };
    }

    async getAllInterestedApplicants() {
        const allSwipes = await this.jobApplicationRepository.find({
            relations: ["student", "student.studentVideoCVs", ...getJobRelations("job_opportunity"),],
            where: {
                company_swipe_direction: IsNull(),
            }
        });

        const groupedApplicants = {};

        for (const swipedJob of allSwipes) {
            const {job_opportunity, student} = swipedJob;
            const {id} = job_opportunity;

            if (!groupedApplicants[id]) {
                groupedApplicants[id] = {
                    job: job_opportunity,
                    applicants: [],
                };
            }
            if (student.isRegistered())
                groupedApplicants[id].applicants.push(student);
        }

        return Object.values(groupedApplicants);
    }

    async getAllMatchedApplicants() {
        // const allSwipes = await this.jobApplicationRepository.find({
        //     relations: ["student", "student.studentVideoCVs", ...getJobRelations("job_opportunity"),],
        //     where: {
        //         company_swipe_direction: SwipeDirection.LIKE,
        //         student_swipe_direction: SwipeDirection.LIKE,
        //     }
        // });

        const matchedJobs = await this.matchEntityRepository.find({
            relations: ["student", "student.studentVideoCVs", ...getJobRelations("job_opportunity"),],
            where: {
                job_started: false,
                is_rejected: false,
            }
        });

        const groupedApplicants = {};

        for (const matched of matchedJobs) {
            const {job_opportunity, student} = matched;
            const {id} = job_opportunity;

            if (!groupedApplicants[id]) {
                groupedApplicants[id] = {
                    job: job_opportunity,
                    applicants: [],
                };
            }

            groupedApplicants[id].applicants.push({
                ...Object.assign({}, student),
                match_id: matched.application_id,
            });
        }

        return Object.values(groupedApplicants);
    }

    async getAllActive() {
        const activeEmployments = await this.employmentRecordRepository.find({
            relations: ["match", "match.student", "match.student.studentVideoCVs", ...getJobRelations("match.job_opportunity"),],

        });

        const groupedApplicants = {};

        for (const matched of activeEmployments) {
            const {job_opportunity, student} = matched.match;
            const {id} = job_opportunity;

            if (!groupedApplicants[id]) {
                groupedApplicants[id] = {
                    job: job_opportunity,
                    applicants: [],
                };
            }

            groupedApplicants[id].applicants.push({
                record_id: matched.match_id,
                ...Object.assign({}, student),
            });
        }

        return Object.values(groupedApplicants);
    }


    async getMatchedAndEmployedApplicants(job_id: number) {
        // let matched_applicants: any = await this.matchEntityRepository.find({
        //     where: {
        //         job_id: job_id,
        //     },
        //     relations: ["student", "student.profile_picture", "application"],
        // });
        //
        // matched_applicants = matched_applicants.map(mapFn);
        //
        // function mapFn(app) {
        //     return {
        //         match_id: app.id,
        //         ...(app.application ? {match_status: {...app.application}} : {}),
        //         ...new SimpleStudent(app.student),
        //     };
        // }
        //
        // const newApplicantsCount = await this.swipedJobsEntityRepository.count({
        //     where: {
        //         swipe_direction: SwipeDirection.LIKE,
        //         id_job: job_id,
        //     },
        // });
        //
        return {
            matched_applicants: [],
            employed_applicants: [],
            new_applicants_count: 0,
        };
    }

    async getAppliedStudents(job_id: number): Promise<AppliedApplicant[]> {


        return [];
    }

    async getRecommendedStudentsForJob(
        company_id: number,
    ): Promise<RecommendedApplicant[]> {
        const students = await this.studentEntityRepository.find({
            relations: {
                profile_picture: true,
                studentVideoCVs: true,
            },
        });
        return students.map((x: StudentEntity) => {
            return {
                ...new RecommendedApplicant(x, null),
            };
        });
    }

    async swipeStudent(
        student_id: number,
        job_opportunity_id: number,
        user_id: string,
        action: SwipeDirection,
    ): Promise<MatchEntity | undefined> {

        const user = await this.userService.findOne(user_id);
        const jobOpportunity = await this.jobOpportunitiesRepository.findOne({
            where: {
                id: job_opportunity_id
            },
            select: ["company_id"],
            loadEagerRelations: false
        });

        let authorized = false;

        if (user === "admin") {
            authorized = true;
        } else if (user instanceof CompanyEntity) {
            authorized = user.id === jobOpportunity.company_id;
        }

        if (!authorized) {
            throw new UnauthorizedException("Unauthorized");
        }

        let applicationEntity = await this.jobApplicationRepository.findOne({
            where: {
                student_id: student_id,
                id_job: job_opportunity_id,
            }
        })

        if (applicationEntity?.student_swipe_direction === SwipeDirection.SAVE) {
            return;
        }

        const student_user_id = await this.userService.getUserIdFromStudentId(student_id);

        applicationEntity.student_id = student_id;
        applicationEntity.id_job = job_opportunity_id;
        applicationEntity.company_swipe_direction = action;
        await this.jobApplicationRepository.save(applicationEntity);
        if (action === SwipeDirection.LIKE) {

            const match = await this.checkMatches(job_opportunity_id, student_id);

            if (match) {
                const notification = new MatchWithCompanyNotification(
                    match.application_id.toString(),
                    match.job_opportunity.company.name,
                );
                await this.notificationService.sendNotificationToUser(
                    student_user_id,
                    notification,
                );
            }

        }
    }

    async swipeJob(
        student_id: number,
        student_user_id: string,
        job_opportunity_id: number,
        action: SwipeDirection,
    ): Promise<MatchEntity | undefined> {
        let applicationEntity = await this.jobApplicationRepository.findOne({
            where: {
                student_id: student_id,
                id_job: job_opportunity_id,
            }
        });
        if (applicationEntity) {
            if (applicationEntity.student_swipe_direction !== SwipeDirection.SAVE)
                return;
        }
        applicationEntity ??= new JobApplicationEntity();
        applicationEntity.student_id = student_id;
        applicationEntity.id_job = job_opportunity_id;
        applicationEntity.student_swipe_direction = action;

        await this.jobApplicationRepository.save(applicationEntity);

        if (action === SwipeDirection.LIKE) {
            const match = await this.checkMatches(job_opportunity_id, student_id);


            return match;
        }
        return;
    }

    async saveMatch(
        student_id: number,
        application_id: number,
        job: JobOpportunityEntity,
        chatId?: string | null,
    ): Promise<MatchEntity> {
        const entity = new MatchEntity();
        entity.application_id = application_id;
        entity.student_id = student_id;
        entity.job_id = job.id;
        entity.job_opportunity = job;
        entity.chat_id = chatId;
        return this.matchEntityRepository.save(entity);
    }

    async checkMatches(
        job_id: number,
        student_id: number,
    ): Promise<MatchEntity | undefined> {

        const application = await this.jobApplicationRepository.findOne({
            where: {
                student_id: student_id,
                id_job: job_id,
            }
        })
        if (application.canMatch() == false) {
            logger.info("cannot match");
            return;
        }


        logger.info("found match for job", job_id, "and student", student_id);

        const student = await this.userService.findOneStudent(student_id);

        const job = await this.jobService.findOne(job_id);

        const chatId = await this.chatService.createChat(
            student_id,
            job.id,
            student.user_id,
            job.company.user_id,
            job_id.toString(),
            new SimpleStudent(student, null),
        );

        return this.saveMatch(student_id, application.id, job, chatId);
    }

    async completeEmployment(id: string) {
        return this.employmentRecordRepository.save({
            match_id: +id,
            completion_date: new Date(),
        });
    }
}