import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class JobSkillsEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    created_by_user_id: string;

    @Column("timestamp with time zone", {
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;
}
