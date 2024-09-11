import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";
import {Exclude} from "class-transformer";

export enum UserType {
    STUDENT = "STUDENT",
    COMPANY = "COMPANY",
    ADMIN = "ADMIN",
}

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryColumn()
    firebase_uid: string;


    @Column({nullable:true})
    email: string;

    @Column({
        type: "enum",
        enum: UserType,
        default: UserType.STUDENT,
    })
    type: UserType;

    @Exclude()
    @Column({
        type: "text",
        array: true,
        default: [],
    })
    notification_tokens: string[];
}
