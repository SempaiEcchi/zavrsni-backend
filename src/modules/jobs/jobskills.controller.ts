import {Body, Controller, Get, Post, Req, UseGuards} from "@nestjs/common";
import {CreateJobSkillDTO, JobSkillsService} from "./jobskills.service.js";
import {basicAuthGuards} from "../users/auth.module.js";

@Controller("skills")
export class JobSkillsController {
    constructor(private readonly jobSkillsService: JobSkillsService) {
    }

    @Get("/")
    @UseGuards(...basicAuthGuards)
    async getJobSkills() {
        const jobSkills = await this.jobSkillsService.getJobSkills();
        return {
            data: jobSkills ?? [],
        };
    }

    @Post("/")
    @UseGuards(...basicAuthGuards)
    async createJobSkills(@Body() body: CreateJobSkillDTO, @Req() req: any) {
        const jobSkills = await this.jobSkillsService.createJobSkills(
            body,
            req.user.user_id,
        );
        return {
            data: jobSkills ?? [],
        };
    }
}
