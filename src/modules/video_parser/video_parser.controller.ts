import {Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors,} from "@nestjs/common";
import {VideoParserService} from "./video_parser.service.js";
import {FileInterceptor} from "@nestjs/platform-express";
import {strictGuardsCompany} from "../users/auth.module.js";
import logger from "../../logger.js";

@Controller("video-parser")
export class VideoParserController {
    constructor(private readonly videoParserService: VideoParserService) {
    }

    @Get("/")
    async get() {
        return this.videoParserService.image();
    }

    @Post("/process-job")
    @UseInterceptors(FileInterceptor("file"))
    @UseGuards(...strictGuardsCompany)
    async processAudioToJob(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error("No file provided");

        const bloc = new Blob([file.buffer], {type: "audio/wav"});
        logger.info("called processAudioToJob");
        return this.videoParserService.processAudioToJob(
            new File([bloc], "audio.mp3"),
        );
    }
}
