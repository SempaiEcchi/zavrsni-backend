import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation} from "typeorm";
import {StudentEntity} from "./students.entity.js";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";
import {SwipeDirection} from "./jobSwipes.entity.js";
import {MatchEntity} from "./match.entity.js";

@Entity()
export class JobApplicationEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("timestamp with time zone", {
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;


    @ManyToOne(() => StudentEntity, {eager: false})
    @JoinColumn({name: "student_id"})
    student: StudentEntity;

    @Column()
    student_id: number;

    @ManyToOne(() => JobOpportunityEntity, {eager: false})
    @JoinColumn({name: "id_job"})
    job_opportunity: JobOpportunityEntity;

    @Column()
    id_job: number;

    @Column({
        type: "enum",
        enum: SwipeDirection,
    })
    student_swipe_direction: SwipeDirection;

    @Column({
        type: "enum",
        enum: SwipeDirection,
        nullable: true,
    })
    company_swipe_direction: SwipeDirection | undefined;

    @Column({

        nullable: true,
    })
    company_reject_reason: string | undefined;


    @OneToOne(() => MatchEntity, (match) => match.application, {nullable: true, cascade: true})
    match: Relation<MatchEntity>


    canMatch() {
        return this.student_swipe_direction === SwipeDirection.LIKE && this.company_swipe_direction === SwipeDirection.LIKE;
    }
}