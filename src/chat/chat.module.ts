import {Module} from "@nestjs/common";
import {UsersModule} from "../modules/users/user.module.js";
import {ChatController} from "./chat.controller.js";
import {ChatService} from "./chat.service.js";
import {NotificationsModule} from "../modules/notifications/notifications.module.js";

@Module({
    imports: [UsersModule, NotificationsModule],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {
}
