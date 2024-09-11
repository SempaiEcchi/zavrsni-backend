import {Injectable,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, Repository} from "typeorm";
import {GetJobProfilesDto} from "./dto/get-job-profiles.dto.js";
import {IndustryEntity} from "../../models/industries.entity.js";
import {JobProfilesEntity} from "../../models/jobProfiles.entity.js";
import {
    getJobRelations,
    JobOpportunityEntity,
    JobType,
    PaymentOption,
    PaymentOptionType,
} from "../../models/jobOpportunities.entity.js";
import {LatLng} from "../../common/ip2location.js";
import {MatchEntity} from "../../models/match.entity.js";
import {CompanyEntity} from "../../models/company.entity.js";
import {StudentEntity,} from "../../models/students.entity.js";
import {Point} from "geojson";
import {faker} from "@faker-js/faker";
import {CreateJobDTO} from "./dto/create-job.dto.js";
import {MediaService} from "../media/media.service.js";
import {UploadedMediaType} from "../../models/media.entity.js";
import {NotificationsService} from "../notifications/notifications.service.js";
import {EmploymentRecordEntity} from "../../models/employmentRecord.entity.js";
import {JobApplicationEntity} from "../../models/jobApplication.entity.js";
import {JobProfileFrequencyEntity} from "../../models/jobProfileFrequency.entity.js";
import {LocationsService} from "../locations/locations.service.js";
import logger from "../../logger.js";


@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(IndustryEntity)
        private industryEntityRepository: Repository<IndustryEntity>,
        @InjectRepository(JobProfilesEntity)
        private jobProfilesEntityRepository: Repository<JobProfilesEntity>,
        @InjectRepository(JobOpportunityEntity)
        private jobOpportunitiesRepository: Repository<JobOpportunityEntity>,
        @InjectRepository(JobProfileFrequencyEntity)
        private jobProfileFrequencyEntityRepository: Repository<JobProfileFrequencyEntity>,
        @InjectRepository(MatchEntity)
        private matchEntityRepository: Repository<MatchEntity>,
        @InjectRepository(StudentEntity)
        private studentEntityRepository: Repository<StudentEntity>,
        @InjectRepository(CompanyEntity)
        private companyEntityRepository: Repository<CompanyEntity>,
        @InjectRepository(EmploymentRecordEntity)
        private employmentRecordEntityRepository: Repository<EmploymentRecordEntity>,
        private mediaService: MediaService,
        private locationService: LocationsService,
        private notificationService: NotificationsService,
    ) {
    }

    getIndustries(name?: string) {
        if (name) {
            return this.industryEntityRepository.find({
                take: 100,
                where: {
                    text: ILike(`%${name}%`),
                },
            });
        } else return this.industryEntityRepository.find({take: 100});
    }

    getJobProfiles(dto: GetJobProfilesDto) {
        return this.jobProfilesEntityRepository.find({
            take: dto.limit,
        });
    }

    findOne(id: number) {
        return this.jobOpportunitiesRepository.findOne({
            where: {id: id},
            relations: getJobRelations(),
        });
    }

    async create(
        dto: Partial<CreateJobDTO>,
        file: Buffer,
        thumbnail: Buffer,
        company_id: number,
    ) {


        logger.info("file size is ", file.length)
        let job = await this.jobOpportunitiesRepository.create();
        job.jobTitle = dto.jobTitle;
        job.company_id = company_id;

        const jobProfileId = await this.jobProfilesEntityRepository.findOneBy({
            name: dto.jobProfileId,
        });
        job.job_profile_id = jobProfileId.id;
        job.jobDescription = dto.jobDescription;
        job.shortDescription = dto.jobDescription;
        job.location_name = dto.location;
        job.payment = new PaymentOption(dto.hourlyRate);
        job.applyDeadline = dto.applyDeadline;
        job.workStartDate = dto.workStartDate;
        job.workEndDate = dto.workEndDate;


        const jobLoc = await this.locationService.getLocationFromCityName(dto.location);

        job.location = {
            type: "Point",
            coordinates: [
                jobLoc.lng,
                jobLoc.lat,
            ],
        }

        job.visible = true
        job.jobType = dto.jobType;
        job.approved = true;
        job.media = await this.mediaService.uploadPublicFile(
            file,
            job.jobTitle.toString() +
            Date.now().toString() +
            ".mp4",
            "job_opportunities",
            UploadedMediaType.VIDEO,
        );


        if (thumbnail) {
            const thumnail = await this.mediaService.uploadPublicFile(
                thumbnail,
                job.jobTitle.toString() +
                Date.now().toString() +
                ".png",
                "job_opportunities",
                UploadedMediaType.IMAGE,
            );
            job.thumbnail = thumnail;
        }

        job = await this.jobOpportunitiesRepository.save(job);
         return this.findOne(job.id);
    }

    async getJobOpportunitiesForStudent(
        location: LatLng | null,
        student: StudentEntity,
    ): Promise<JobOpportunityEntity[]> {

        const student_id = student.id;

        console.time("getJobOpportunities2");

        const frequencyMap: JobProfileFrequencyEntity[] = await this.jobProfileFrequencyEntityRepository.createQueryBuilder("freq").where("freq.student_id = :student_id", {student_id}).getMany();

        const jobProfiles = frequencyMap.sort((a, b) => b.frequency - a.frequency).map((f) => f.job_profile_id);


        let allJobs = [];
        if (student.email?.includes("@") && jobProfiles.length > 0) {

            const lng = location?.lng || 0;
            const lat = location?.lat || 0;

            const kilomenters = 30;
            allJobs = await this.jobOpportunitiesRepository.createQueryBuilder("job")
                .where("job.visible = true")
                .leftJoinAndSelect("job.company", "company").leftJoinAndSelect("job.media", "media")
                .leftJoinAndSelect("company.logo", "logo")
                .leftJoinAndSelect("job.jobProfile", "jobProfile")
                .leftJoin(
                    JobApplicationEntity,
                    'viewedJob',
                    'viewedJob.id_job = job.id AND viewedJob.student_id = :student_id',
                    {student_id}
                )
                .where('viewedJob.id IS NULL')
                .andWhere('job.job_profile_id IN (:...jobProfiles)', {jobProfiles})
                .andWhere("ST_Distance_Sphere(ST_MakePoint(job.location.coordinates[0], job.location.coordinates[1])," +
                    " ST_MakePoint(:lng, :lat)) < :kilomenters * 1000", {lng, lat, kilomenters})
                .orderBy(`ARRAY_POSITION(:jobProfiles::int[], job.job_profile_id)`, 'ASC').setParameters({
                    student_id,
                    jobProfiles
                })
                .getMany();
        } else {
            allJobs = await this.jobOpportunitiesRepository.find(
                {
                    relations: getJobRelations(),
                    take: 50,
                }
            )
        }


        console.timeEnd("getJobOpportunities2");

        return allJobs;
    }

    async getJobOpportunity(id: string): Promise<JobOpportunityEntity> {
        return this.jobOpportunitiesRepository.findOne(
            {
                where: {id: +id},

                relations: getJobRelations(),
            }
        )
    }


    async getCompanyJobs(id: string) {
        return this.jobOpportunitiesRepository.find({
            where: id === "all" ? {} : {
                visible: true,
                company_id: +id,
            },
            relations: getJobRelations(),
            loadEagerRelations: false,
        });
    }

    async getEmployerJobOffers(company_id: number) {
        const allJobs = await this.jobOpportunitiesRepository.find({
            where: {
                company_id: +company_id,
            },
            relations: getJobRelations(),
            loadEagerRelations: false,
            take: 100,
        });

        return {
            active_jobs: allJobs.filter((job) => job.applyDeadline > new Date()),
            elapsed_jobs: allJobs.filter((job) => job.applyDeadline < new Date()),
        };
    }


    async createFakeJob(company_id: number) {
        const result = await this.fakerCreation(
            this.jobProfilesEntityRepository,
            this.industryEntityRepository,
            company_id,
        );
        await this.companyEntityRepository
            .createQueryBuilder("company")
            .update(CompanyEntity)
            .where("id = :id", {id: company_id})
            .set({open_positions: () => "open_positions + 1"})
            .execute();
        return result;
    }

    private async fakerCreation(
        jobProfilesRepository,
        industryRepository,
        company_id,
    ) {
        const pietasJob = await jobProfilesRepository.findOne({
            where: {name: "Konobar"},
        });

        const pointObject: Point = {
            type: "Point",
            coordinates: [13.848, 44.866],
        };

        const date = new Date(2024, 12, 20 + Math.floor(Math.random() * 10));

        logger.info(date);

        const jobOp: Partial<JobOpportunityEntity> = {
            jobTitle: faker.person.jobTitle(),
            company_id: company_id,
            job_profile_id: pietasJob.id,
            jobDescription: faker.person.jobDescriptor(),
            shortDescription: faker.lorem.sentence(),
            location: pointObject,
            payment: {
                type: PaymentOptionType.FIXED,
                amount: 5,
                currency: "EUR",
            },
            url: "https://media.tenor.com/1aNfr0BSFLgAAAAM/staatsloterij-dancing.gif",
            approved: true,
            applyDeadline: date,
            workStartDate: date,

            jobType: JobType.FULL_TIME,
        };

        const job = await this.jobOpportunitiesRepository.save(jobOp);

        return this.findOne(job.id);
    }

    async refreshOpenPositions() {
        const connection = await this.companyEntityRepository.manager.connection;

        await connection.query(`
            UPDATE company_entity
            SET open_positions = (SELECT COUNT(*)
                                  FROM job_opportunity_entity
                                  WHERE company_id = company_entity.id)
        `);

        return "Ok"

     }


}
