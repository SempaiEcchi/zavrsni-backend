import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {JobProfileFrequencyEntity} from "./jobProfileFrequency.entity.js";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";
import {StudentVideoCVEntity} from "./studentVideoCV.entity.js";

@Entity()
export class JobProfilesEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    emoji: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => JobProfileFrequencyEntity, (jobpf) => jobpf.student)
    frequencies: Relation<JobProfileFrequencyEntity>[];

    @OneToMany(
        () => JobOpportunityEntity,
        (jobOpportunities) => jobOpportunities.jobProfile,
    )
    opportunities: Relation<JobOpportunityEntity[]>;

    @ManyToMany(
        () => StudentVideoCVEntity,
        (studentVideoCVs) => studentVideoCVs.jobProfiles,
    )
    studentVideoCVs: Relation<StudentVideoCVEntity[]>;
}
