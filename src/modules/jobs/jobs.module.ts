import {Module} from "@nestjs/common";
import {JobsService} from "./jobs.service.js";
import {JobsController} from "./jobs.controller.js";
import {TypeOrmModule} from "@nestjs/typeorm";

import {JobRecommendationsService} from "../job.reccomendations.service.js";
import {IndustryEntity} from "../../models/industries.entity.js";
import {JobProfilesEntity} from "../../models/jobProfiles.entity.js";
import {JobOpportunityEntity} from "../../models/jobOpportunities.entity.js";
import {UserEntity} from "../../models/user.entity.js";
import {StudentEntity} from "../../models/students.entity.js";
import {UsersModule} from "../users/user.module.js";
import {ChatModule} from "../../chat/chat.module.js";
import {MatchEntity} from "../../models/match.entity.js";
import {JobSkillsEntity} from "../../models/jobSkills.entity.js";
import {JobSkillsController} from "./jobskills.controller.js";
import {JobSkillsService} from "./jobskills.service.js";
import {CompanyEntity} from "../../models/company.entity.js";
import {MediaModule} from "../media/media.module.js";
import {NotificationsModule} from "../notifications/notifications.module.js";
import {EmploymentRecordEntity} from "../../models/employmentRecord.entity.js";
import {MatchService} from "./match.service.js";
import {JobApplicationEntity} from "../../models/jobApplication.entity.js";
import {JobProfileFrequencyEntity} from "../../models/jobProfileFrequency.entity.js";
import {LocationsService} from "../locations/locations.service.js";

@Module({
    imports: [
        ChatModule,
        UsersModule,
        MediaModule,
        NotificationsModule,
        TypeOrmModule.forFeature([
            IndustryEntity,
            UserEntity,
            MatchEntity,
            StudentEntity,
            JobProfilesEntity,
            JobProfileFrequencyEntity,
            JobOpportunityEntity,
            JobApplicationEntity,
            JobSkillsEntity,
            CompanyEntity,
            EmploymentRecordEntity,
        ]),
    ],
    controllers: [JobsController, JobSkillsController],
    providers: [LocationsService, JobRecommendationsService, JobsService, MatchService,  JobSkillsService],
    exports: [JobsService],
})
export class JobsModule {
}
