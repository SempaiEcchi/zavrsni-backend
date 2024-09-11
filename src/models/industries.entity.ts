import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";

@Entity()
export class IndustryEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Index()
    @Column()
    text: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => IndustryEntity, (industry) => industry.children)
    @JoinColumn({name: "parent_id"})
    parent: IndustryEntity;

    @Column({nullable: true})
    parent_id: number;

    @OneToMany(() => IndustryEntity, (industry) => industry.parent, {
        nullable: true,
    })
    children: IndustryEntity[];

    @OneToMany(
        () => JobOpportunityEntity,
        (jobOpportunities) => jobOpportunities.jobProfile,
    )
    opportunities: Relation<JobOpportunityEntity[]>;
}
