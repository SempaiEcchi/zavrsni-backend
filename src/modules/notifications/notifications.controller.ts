import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {NotificationsService} from "./notifications.service.js";
import {ApiProperty} from "@nestjs/swagger";
import {basicAuthGuards} from "../users/auth.module.js";

export class SendNotificationDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    body: string;
}

@Controller("notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {
    }

    @Get()
    @UseGuards(...basicAuthGuards)
    async getNotifications(@Req() req) {
        return this.notificationsService.fetchNotifications(req.user.user_id);
    }
}
