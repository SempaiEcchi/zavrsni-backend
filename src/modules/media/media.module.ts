import {Module} from "@nestjs/common";
import {MediaService} from "./media.service.js";
import {FileStorageService, S3PublicFileService} from "./s3.service.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MediaEntity} from "../../models/media.entity.js";

const storageProvider = {
    provide: "FileStorageService",
    useClass: S3PublicFileService,
};

@Module({
    imports: [TypeOrmModule.forFeature([MediaEntity])],
    providers: [storageProvider, MediaService],
    exports: [MediaService, storageProvider],
})
export class MediaModule {
}
