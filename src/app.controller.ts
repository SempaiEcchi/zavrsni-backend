import {Controller, Get, Redirect, Request} from "@nestjs/common";
import {AppService} from "./app.service.js";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    @Redirect("https://firmus.hr")
    getHello(@Request() req) {
        return {url: "https://firmus.hr"};
    }
}
