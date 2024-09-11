import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,} from "typeorm";
import {FirmusNotification} from "../modules/notifications/firmus.notification.js";

@Entity()
export class SentNotificationEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({type: "jsonb"})
    notification: FirmusNotification;

    @Column({default: false})
    is_read: boolean;

    @Column()
    receiver_id: string;
}
