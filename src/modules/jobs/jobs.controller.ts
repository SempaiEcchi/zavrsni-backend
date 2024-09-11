import {Body, Controller, Get, Ip, Param, Post, Query, Req, UnauthorizedException, UseGuards,} from "@nestjs/common";
import {JobsService} from "./jobs.service.js";
import {CreateJobDTO} from "./dto/create-job.dto.js";
import {
    basicAuthGuards,
    IsAdminGuard,
    ResolveStudent,
    strictGuardsCompany,
    ValidateStudent,
} from "../users/auth.module.js";
import {UserService} from "../users/user.service.js";
import {ApiConsumes, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {IndustryEntity} from "../../models/industries.entity.js";
import {NotificationsService} from "../notifications/notifications.service.js";
import {MatchService} from "./match.service.js";
import {StudentEntity} from "../../models/students.entity.js";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
    constructor(
        private readonly userService: UserService,
        private readonly jobsService: JobsService,
        private readonly matchService: MatchService,
        private readonly notificationsService: NotificationsService,
    ) {
    }

    @Get("/")
    async getSomething() {
        return {
            data: {
                something: "something",
            },
        };
    }

    @Get("/opportunity/:id")
    // @UseGuards(...strictGuards)
    async getJobOpportunity(@Param("id") id: string) {
        const job = await this.jobsService.getJobOpportunity(id);
        return {
            data: job,
        };
    }

    // pošalji zahtjev za posao

    @Get("/match/:id")
    @UseGuards(...basicAuthGuards)
    async getMatchDetails(@Param("id") id: string, @Req() req) {
        return this.matchService.getMatchDetails(id, req.user.user_id);
    }

    @Get("/match/:id/accept")
    @UseGuards(...basicAuthGuards)
    async acceptMatch(@Param("id") id: string, @Req() req) {
        const user = await this.userService.findOneUser(req.user.user_id);
        return this.matchService.acceptMatch(id, user);
    }

    @Get("/match/:id/cancel")
    @UseGuards(...basicAuthGuards)
    async cancelMatch(@Param("id") id: string, @Req() req) {
        const user = await this.userService.findOneUser(req.user.user_id);
        return this.matchService.cancelMatch(id, user);
    }


    @Get("/match/:id/employ")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async startJob(@Param("id") id: string, @Req() req) {
        return this.matchService.startJob(id);
    }

    @Get("/match/:id/reject")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async rejectStudent(@Param("id") id: string, @Req() req) {
        return this.matchService.rejectStudent(id);
    }


    @Get("/update")
    async updateOpenPositions() {
        return this.jobsService.refreshOpenPositions();
    }

    @Post("/company/:company_id")
    @UseGuards(...basicAuthGuards)


    async create(
        @Body() dto: Partial<CreateJobDTO>,
        @Req() req,
        @Param("company_id") company_id: string,
    ) {


        const company = await this.userService.findOneCompany(+company_id);

        if (company.user_id !== req.user.user_id) {
            throw new UnauthorizedException("Cannot create job for other company");
        }


        const videoBuffer = Buffer.from(dto["file"], "base64");
        const thumnbailBuffer = dto["thumbnail"] ? Buffer.from(dto["thumbnail"], "base64") : null

        const response = {
            data: (dto as any).fake
                ? await this.jobsService.createFakeJob(+company_id)
                : await this.jobsService.create(dto, videoBuffer, thumnbailBuffer, +company_id),
        };

        this.jobsService.refreshOpenPositions();

        return response;
    }

    @Get("/industries")
    @ApiOkResponse({type: IndustryEntity, isArray: true})
    // @UseGuards(...strictGuards)
    async getIndustries(@Query("query") name: string) {
        const jobs = await this.jobsService.getIndustries(name);
        return {
            data: jobs ?? [],
        };
    }

    @Get("/job-profiles")
    @UseGuards(...basicAuthGuards)
    async allJobProfiles() {
        const jobs = await this.jobsService.getJobProfiles({
            limit: 1000,
        });
        return {
            data: jobs ?? [],
        };
    }

    @Get("/company/:company_id")
    @UseGuards(...basicAuthGuards)
    async getCompanyJobOffers(@Param("company_id") id: string) {
        const jobs = await this.jobsService.getCompanyJobs(id);
        return {
            data: jobs ?? [],
        };
    }

    @Get("/employer/:company_id")
    @UseGuards(...strictGuardsCompany)
    async getEmployerJobOffers(@Param("company_id") id: number, @Req() req) {
        const jobs = await this.jobsService.getEmployerJobOffers(id);
        return {
            data: {
                active_jobs: jobs.active_jobs,
                elapsed_jobs: jobs.elapsed_jobs,
            },
        };
    }

    @Get("/employer/:company_id/opportunity/:job_id")
    @ApiConsumes("multipart/form-data")
    @UseGuards(...strictGuardsCompany)
    async getJobDetails(
        @Param("company_id") id: number,
        @Param("job_id") job_id: number,
        @Req() req,
    ) {
        const jobs = await this.matchService.getMatchedAndEmployedApplicants(job_id);
        return {
            data: {
                new_applicants_count: jobs.new_applicants_count,
                matched_applicants: jobs.matched_applicants,
                employed_applicants: jobs.employed_applicants,
            },
        };
    }

    @Get("/employer/:company_id/opportunity/:job_id/swipeable-students")
    @UseGuards(...strictGuardsCompany)
    async getAppliedStudentsForJob(
        @Param("company_id") company_id: number,
        @Param("job_id") job_id: number,
        @Req() req,
    ) {
        const students = await this.matchService.getAppliedStudents(job_id);
        const recommendedStudents =
            await this.matchService.getRecommendedStudentsForJob(job_id);

        return {
            data: {
                swipeable_students: students ?? [],
                recommended_students: recommendedStudents ?? [],
            },
        };
    }

    @Get("/job-opportunities")
    @UseGuards(...basicAuthGuards, ResolveStudent)
    async jobOpportunities(@Ip() ip, @Req() req) {
        const isAnon = !req.student;

        const location = (req.student as StudentEntity).location;


        const jobs =
            await this.jobsService.getJobOpportunitiesForStudent(location?.latLng(), req.student);

        return {
            data: {
                job_opportunities: jobs ?? [],
            },
        };
    }

    @Post("/job-swipe")
    @UseGuards(...basicAuthGuards, ValidateStudent)
    async swipeJob(@Req() req, @Body() body) {
        const didMatch = await this.matchService.swipeJob(
            +req.student_id,
            req.user.user_id,
            +body.job_opportunity_id,
            body.action,
        );

        return {
            data: {
                match_id: didMatch?.application_id + "",
                did_match: !!didMatch,
                chat_id: didMatch?.chat_id,
            },
        };
    }

    @Post("/student-swipe")
    @UseGuards(...basicAuthGuards)
    async swipeStudent(@Req() req, @Body() body: any) {
        const didMatch = await this.matchService.swipeStudent(
            +body.student_id,
            +body.job_opportunity_id,
            req.user.user_id,
            body.action,
        );

        return {
            data: {
                match_id: didMatch?.application_id + "",
                did_match: !!didMatch,
                chat_id: didMatch?.chat_id,
            },
        };
    }

    @Get("/saved-jobs")
    @UseGuards(...basicAuthGuards, ResolveStudent)
    async savedJobs(@Req() req) {
        const jobs = await this.matchService.getStudentJobs(
            req.student.id,
        );

        return {
            data: {
                saved_jobs: jobs.saved_jobs,
                applied_jobs: jobs.applied_jobs,
                matched_jobs: jobs.matched_jobs,
                active_jobs: jobs.active_jobs,
            },
        };
    }

    @Post("/employment/:id/complete")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async completeEmployment(@Param("id") id: string) {
        return this.matchService.completeEmployment(id);
    }


    @Get("/admin/all-interested-applicants")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async getAllInterestedApplicants() {
        return this.matchService.getAllInterestedApplicants();
    }

    @Get("/admin/all-matched-applicants")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async getAllMatchedApplicants() {
        return this.matchService.getAllMatchedApplicants();
    }


    @Get("/admin/all-employed-applicants")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async getAllActive() {
        return this.matchService.getAllActive();
    }
}
