import {UploadedMediaType} from "../../models/media.entity.js";

export class CreateMediaDto {
    key: string;
    url: string;
    type: UploadedMediaType;
}

export class DeleteMediaDto {
    key: string;
}
