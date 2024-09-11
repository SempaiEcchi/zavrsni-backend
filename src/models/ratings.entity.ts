import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation} from "typeorm";
import {MatchEntity} from "./match.entity.js";
import {EmploymentRecordEntity} from "./employmentRecord.entity.js";

@Entity()
export class RatingEntity extends BaseEntity {
    @PrimaryColumn()
    job_record_id: number;


    @OneToOne(() => EmploymentRecordEntity, (e) => e.rating)
    @JoinColumn({name: "job_record_id"})
    employment_record: Relation<EmploymentRecordEntity>;

    @Column()
    studentRating: number;

    @Column()
    employeerRating: number;

    @Column()
    studentComment: string;

    @Column()
    employeerComment: string;

    @Column("timestamp with time zone", {
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;
}
