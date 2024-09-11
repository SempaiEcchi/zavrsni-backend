import {Injectable} from "@nestjs/common";

import {v4 as uuid} from "uuid";
import {DeleteMediaDto} from "./dto.js";

import {DeleteObjectCommand, ObjectCannedACL, PutObjectCommand, S3, S3Client,} from "@aws-sdk/client-s3";
import {ConfigService} from "@nestjs/config";
import logger from "../../logger.js";

export interface FileStorageService {
    uploadFile(
        dataBuffer: Buffer,
        filename: string,
        folder: string,
    ): Promise<UploadResult>;

    deleteFile(fileDto: DeleteMediaDto): Promise<{ deleted: boolean }>;
}

@Injectable()
export class S3PublicFileService implements FileStorageService {
    private storage: S3Client;
    private bucketName: string;
    private endpoint: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.endpoint = this.configService.get("DO_URL");
        this.storage = new S3({
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            endpoint: this.endpoint,
            region: "fra1",
            credentials: {
                accessKeyId: this.configService.get("DO_KEY"),
                secretAccessKey: this.configService.get("DO_SECRET"),
            },
        });

        this.bucketName = "firmusjobs";
    }

    async uploadFile(
        dataBuffer: Buffer,
        filename: string,
        folder: string,
    ): Promise<UploadResult> {
        const fullFilename = `${folder}/${uuid()}-${filename}`;
        const bucketParams = {
            Bucket: this.bucketName,
            Key: fullFilename,
            Body: dataBuffer,
            ACL: ObjectCannedACL.public_read,
        };
        try {
            const res = await this.storage.send(new PutObjectCommand(bucketParams));
        } catch (error) {
            logger.info(error);
            throw error;
        }
        return new UploadResult({
            url: `https://firmusjobs.fra1.digitaloceanspaces.com/${fullFilename}`,
            key: fullFilename,
        });
    }

    async deleteFile(fileDto: DeleteMediaDto): Promise<{ deleted: boolean }> {
        const input = {
            Bucket: this.bucketName,
            Key: fileDto.key,
        };
        const command = new DeleteObjectCommand(input);

        try {
            await this.storage.send(command);
        } catch (err) {
            return {deleted: false};
        }

        return {deleted: true};
    }
}

export class UploadResult {
    url: string;
    key: string;


    constructor({url, key}: { url: string; key: string }) {
        this.url = url;
        this.key = key;
    }
}
