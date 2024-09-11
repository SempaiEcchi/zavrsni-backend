import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {WaitlistEntity} from "../models/waitlist.entity.js";
import {WaitlistService} from "./waitlist.service.js";
import {WaitlistController} from "./waitlist.controller.js";

@Module({
    imports: [TypeOrmModule.forFeature([WaitlistEntity])],
    controllers: [WaitlistController],
    providers: [WaitlistService],
})
export class WaitlistModule {
}
