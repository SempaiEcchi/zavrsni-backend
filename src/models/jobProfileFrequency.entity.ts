import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {StudentEntity} from "./students.entity.js";
import {JobProfilesEntity} from "./jobProfiles.entity.js";

const MIN_FREQUENCY = 0;
const MAX_FREQUENCY = 10;
const DEFAULT_FREQUENCY = 5;

@Entity()
export class JobProfileFrequencyEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    // @Check(`"frequency" >= ${MIN_FREQUENCY} AND "frequency" <= ${MAX_FREQUENCY}`)
    @Column()
    frequency: number;

    @ManyToOne(() => StudentEntity, (st) => st.jobProfileFrequencies)
    @JoinColumn({name: "student_id"})
    student: Relation<StudentEntity>;

    @Column()
    student_id: number;

    @ManyToOne(() => JobProfilesEntity, (st) => st.frequencies)
    @JoinColumn({name: "job_profile_id"})
    jobProfile: Relation<JobProfilesEntity>;

    @Column()
    job_profile_id: number;
}
