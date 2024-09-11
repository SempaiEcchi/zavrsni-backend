import {Body, Controller, Post} from "@nestjs/common";
import {WaitlistService} from "./waitlist.service.js";
import {CreateWaitlistDto} from "./dto/create-waitlist.dto.js";
import {Throttle} from "@nestjs/throttler";

@Controller("waitlist")
export class WaitlistController {
    constructor(private readonly waitlistService: WaitlistService) {
    }

    @Throttle({default: {limit: 10, ttl: 60000}})
    @Post()
    async create(@Body() createWaitlistDto: CreateWaitlistDto) {
        await this.waitlistService.create(createWaitlistDto);
        return {message: "success"};
    }
}
