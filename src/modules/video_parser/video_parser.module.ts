import {Module} from "@nestjs/common";
import {VideoParserController} from "./video_parser.controller.js";
import {VideoParserService} from "./video_parser.service.js";
import {UsersModule} from "../users/user.module.js";

@Module({
    imports: [UsersModule],
    controllers: [VideoParserController],
    providers: [VideoParserService],
})
export class VideoParserModule {
}
