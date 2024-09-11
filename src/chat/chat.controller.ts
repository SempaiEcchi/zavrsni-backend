import {Body, Controller, Param, Post, Req, UseGuards} from "@nestjs/common";
import {ChatService} from "./chat.service.js";
import {basicAuthGuards} from "../modules/users/auth.module.js";
import {UserService} from "../modules/users/user.service.js";
import {NotificationsService} from "../modules/notifications/notifications.service.js";
import {CompanyEntity} from "../models/company.entity.js";
import {StudentEntity} from "../models/students.entity.js";
import {ChatNotification} from "../modules/notifications/firmus.notification.js";

@Controller("chat")
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly notificationService: NotificationsService,
    ) {
    }

    @Post("/:id/messages")
    @UseGuards(...basicAuthGuards)
    async sendMessage(@Param("id") chatId: string, @Req() req, @Body() body) {
        const user = await this.userService.findOneUser(req.user.user_id);

        const receiver = await this.chatService.sendMessage(
            chatId,
            body.message,
            user.type,
            req.user.user_id,
        );

        const name = await this.userService
            .findOne(user.firebase_uid)
            .then(function (user) {
                if (user instanceof StudentEntity) {
                    return user.first_name + " " + user.last_name;
                }
                if (user instanceof CompanyEntity) {
                    return user.name;
                }
            });

        this.notificationService.sendNotificationToUser(
            receiver,
            new ChatNotification(body.message, chatId, name),
        );

        return {
            data: {
                message: "Sent",
            },
        };
    }
}
