import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller.js";
import {UserService} from "./user.service.js";

import {MediaModule} from "../media/media.module.js";
import {StudentEntity} from "../../models/students.entity.js";
import {CompanyEntity} from "../../models/company.entity.js";
import {UserEntity} from "../../models/user.entity.js";
import {JobProfileFrequencyEntity} from "../../models/jobProfileFrequency.entity.js";
import {StudentVideoCVEntity} from "../../models/studentVideoCV.entity.js";
import {StudentProfileService} from "./student.profile.service.js";
import {LocationEntity} from "../../models/location.entity.js";
import {LocationsService} from "../locations/locations.service.js";
import {AuthService} from "./auth.service.js";
import {MailModule} from "../mail/mail.module.js";

@Module({
    imports: [
        MediaModule,
        MailModule,
        TypeOrmModule.forFeature([
            StudentEntity,
            CompanyEntity,
            LocationEntity,
            UserEntity,
            JobProfileFrequencyEntity,
            StudentVideoCVEntity,
        ]),
    ],
    providers: [LocationsService,
        StudentProfileService, UserService, AuthService],
    controllers: [UserController],
    exports: [UserService, AuthService],
})
export class UsersModule {
}
