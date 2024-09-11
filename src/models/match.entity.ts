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
import {StudentEntity} from "./students.entity.js";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";
import {EmploymentRecordEntity} from "./employmentRecord.entity.js";
import {JobApplicationEntity} from "./jobApplication.entity.js";

@Entity()
export class MatchEntity extends BaseEntity {

    @PrimaryColumn()
    application_id: number;


    @ManyToOne(() => JobOpportunityEntity)
    @JoinColumn({name: "job_id"})
    job_opportunity: Relation<JobOpportunityEntity>;

    @Column()
    job_id: number;

    @ManyToOne(() => StudentEntity)
    @JoinColumn({name: "student_id"})
    student: Relation<StudentEntity>;

    @Column()
    student_id: number;

    @Column({nullable: true})
    chat_id: string;

    @OneToOne(() => EmploymentRecordEntity, (employmentRecord) => employmentRecord.match, {
        nullable: true,
        cascade: true
    })
    employment_record: Relation<EmploymentRecordEntity>;

    @OneToOne(() => JobApplicationEntity, (application) => application.match)
    @JoinColumn({name: "application_id"})
    application: Relation<JobApplicationEntity>;


    @Column({nullable: false, default: false})
    job_started: boolean;


    @Column({default: false})
    is_rejected: boolean;


    @CreateDateColumn()
    created_at: Date;
}
