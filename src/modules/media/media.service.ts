import {HttpException, HttpStatus, Inject, Injectable, NotFoundException,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FileStorageService, UploadResult} from "./s3.service.js";
import {CreateMediaDto, DeleteMediaDto} from "./dto.js";
import {MediaEntity, UploadedMediaType} from "../../models/media.entity.js";
import {Repository} from "typeorm";
import logger from "../../logger.js";

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(MediaEntity)
        private mediaRepository: Repository<MediaEntity>,
        @Inject("FileStorageService")
        private storageService: FileStorageService,
    ) {
    }

    public async getFileById(id: number) {
        try {
            const file = this.byId(id);
            if (!file) {
                throw new NotFoundException("File not found");
            }
            return file;
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    public async deleteMedia(fileId: number) {
        const file = await this.getFileById(fileId);
        if (!file.providerData) {
            return {deleted: true};
        }
        try {
            const fileDto: DeleteMediaDto = {
                key: file.providerData,
            };
            await this.storageService.deleteFile(fileDto);

            return await this.deleteFile(fileId);
        } catch (error) {
            logger.info(error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    public async uploadPublicFile(
        dataBuffer: Buffer,
        filename: string,
        folder: string,
        type: UploadedMediaType,
    ) {
        try {
            const uploadResult: UploadResult = await this.storageService.uploadFile(
                dataBuffer,
                filename,
                folder,
            );
            const fileDto: CreateMediaDto = {
                key: uploadResult.key,
                url: uploadResult.url,
                type: type,
            };
            const newFile = await this.createPublicFile(fileDto);
            return newFile;
        } catch (error) {
            logger.info(error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    private async createPublicFile(fileDto: CreateMediaDto) {
        const media = new MediaEntity();
        media.url = fileDto.url;
        media.providerData = fileDto.key;
        media.type = fileDto.type;

        await this.mediaRepository.save(media);
        return media;
    }

    public async byId(id: number) {
        return await this.mediaRepository.findOne({where: {id: id}});
    }

    public async deleteFile(id: number) {
        await this.mediaRepository.delete(id);
        return {
            deleted: true,
        };
    }
}
