import {
    AfterLoad,
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {MediaEntity} from "./media.entity.js";
import {StudentEntity} from "./students.entity.js";
import {JobProfilesEntity} from "./jobProfiles.entity.js";

@Entity()
export class StudentVideoCVEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @OneToOne(() => MediaEntity, {eager: true, onDelete: "SET NULL"})
    @JoinColumn()
    video: MediaEntity;

    @OneToOne(() => MediaEntity, {eager: true, onDelete: "SET NULL"})
    @JoinColumn()
    thumbnail: MediaEntity;

    @ManyToOne(
        () => StudentEntity,
        (studentEntity) => studentEntity.studentVideoCVs,
        {eager: false},
    )
    @JoinColumn({name: "student_id"})
    studentEntity: Relation<StudentEntity>;

    //job profiles
    @ManyToMany(
        () => JobProfilesEntity,
        (jobProfiles) => jobProfiles.studentVideoCVs,
        {eager: true},
    )
    @JoinTable()
    jobProfiles: Relation<JobProfilesEntity[]>;

    job_profiles: number[] = [];

    @AfterLoad()
    async loadJobProfiles() {
        if (this.jobProfiles) {
            this.job_profiles = this.jobProfiles.map((jp) => jp.id);
        }
    }

    @Index()
    @Column()
    student_id: number;
}
