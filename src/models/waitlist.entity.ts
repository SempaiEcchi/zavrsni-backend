import {BaseEntity, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,} from "typeorm";

@Entity()
export class WaitlistEntity extends BaseEntity {
    @PrimaryColumn()
    email: string;

    @PrimaryColumn({default: false})
    isAlpha: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
