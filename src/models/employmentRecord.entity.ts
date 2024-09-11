import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    Relation,
} from "typeorm";
import {MatchEntity} from "./match.entity.js";
import {StudentEntity} from "./students.entity.js";
import {RatingEntity} from "./ratings.entity.js";

@Entity()
export class EmploymentRecordEntity extends BaseEntity {


    @OneToOne(() => MatchEntity, (match) => match.employment_record)
    @JoinColumn({name: "match_id"})
    match: Relation<MatchEntity>;

    @PrimaryColumn()
    match_id: number;

    @Column({nullable: true})
    cancel_reason: string;

    @Column({nullable: true})
    completion_date: Date;


    @ManyToOne(() => StudentEntity)
    @JoinColumn({name: "student_id"})
    student: Relation<StudentEntity>



    @OneToOne(() => RatingEntity, (r) => r.employment_record, {
        nullable: true,
        cascade: true
    })
    rating: Relation<RatingEntity>;

    @Column()
    student_id: number;

    @Column()
    company_id: number;

    @CreateDateColumn()
    created_at: Date;
}
