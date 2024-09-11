import {Module} from "@nestjs/common";
import {NotificationsService} from "./notifications.service.js";
import {NotificationsController} from "./notifications.controller.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StudentEntity} from "../../models/students.entity.js";
import {UserEntity} from "../../models/user.entity.js";
import {SentNotificationEntity} from "../../models/sentNotification.entity.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentEntity,
            UserEntity,
            SentNotificationEntity,
        ]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {
}
