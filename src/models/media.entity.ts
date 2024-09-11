import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,} from "typeorm";

export enum UploadedMediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
}

@Entity()
export class MediaEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({nullable: true})
    url: string;

    @Column({
        type: "enum",
        enum: UploadedMediaType,
        default: UploadedMediaType.IMAGE,
    })
    type: UploadedMediaType;

    @Column({nullable: true})
    providerData: string;
}
