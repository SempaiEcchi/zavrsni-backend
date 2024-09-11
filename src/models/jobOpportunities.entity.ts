import {
    AfterLoad,
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {CompanyEntity} from "./company.entity.js";
import {MediaEntity, UploadedMediaType} from "./media.entity.js";
import {Point} from "geojson";
import {JobProfilesEntity} from "./jobProfiles.entity.js";

export enum JobType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    INTERNSHIP = "INTERNSHIP",
    PROJECT = "PROJECT",
    VOLUNTEERING = "VOLUNTEERING",
    OTHER = "OTHER",
}

@Entity()
export class JobOpportunityEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    jobTitle: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    jobDescription: string;

    @Column({default: 1})
    employeesNeeded: number;

    @Column({nullable: true})
    shortDescription: string;

    @AfterLoad()
    async setShortDescription() {
        if (this.jobDescription) {
            this.shortDescription = this.jobDescription.substring(0, 100);
        }
    }

    @Index({spatial: true})
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: true,
    })
    location: Point;

    @Column({nullable: true})
    location_name: string;


    @Column({
        type: "jsonb",
    })
    payment: Relation<PaymentOption>;

    @OneToOne(() => MediaEntity, {
        eager: true,
        nullable: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({name: "media_id"})
    media: Relation<MediaEntity>;



    @OneToOne(() => MediaEntity, {
        eager: true,
        nullable: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({name: "thumbnail_id"})
    thumbnail: Relation<MediaEntity>;


    thumbnail_id: number;

    @Column({nullable: true})
    media_id: number;

    @Column({nullable: true})
    url: string;

    @Column({default: false})
    isVideo: boolean;

    @AfterLoad()
    async setIsVideo() {
        if (this.media) {
            this.url = this.media.url;
            this.isVideo = this.media.type === UploadedMediaType.VIDEO;
        }
    }

    @Column({default: true})
    approved: boolean;

    @Column()
    applyDeadline: Date;

    @Column({nullable: true})
    workStartDate: Date;

    @Column({nullable: true})
    workEndDate: Date;

    @ManyToOne(() => JobProfilesEntity, (jobp) => jobp.opportunities, {
        eager: false,
    })
    @JoinColumn({name: "job_profile_id"})
    jobProfile: Relation<JobProfilesEntity>;

    @Column()
    job_profile_id: number;

    @ManyToOne(() => CompanyEntity, (company) => company.opportunities, {
        eager: false,
        nullable: true,
    })
    @JoinColumn({name: "company_id"})
    company: Relation<CompanyEntity>;

    @Column({nullable: true})
    company_id: number;

    @Column({default: true})
    visible: boolean;

    @AfterLoad()
    async setCompany() {
        if(!this.company_id){
            this.company = await CompanyEntity.findOne({
                where: {
                    name: "DPoslovi",
                }
            });
            this.company_id = this.company.id;
        }
    }

    @Column({
        type: "enum",
        enum: JobType,
        default: JobType.FULL_TIME,
    })
    jobType: JobType;

    @Column({
        type: "text",
        default: [],
        array: true,
    })
    tags: string[];
}

export function getJobRelations(prefix?: string) {

    const relations = ["company", "company.logo", "media", "jobProfile"];

    if (prefix) {
        return relations.map((relation) => `${prefix}.${relation}`);
    }

    return relations;

}


export enum PaymentOptionType {
    HOURLY = "HOURLY",
    FIXED = "FIXED",
    MONTHLY = "MONTHLY",
}

export class PaymentOption {
    type: PaymentOptionType;

    amount: number;

    currency = "EUR";

    constructor(amount: number) {
        this.type = PaymentOptionType.HOURLY;
        this.amount = amount;
    }
}
