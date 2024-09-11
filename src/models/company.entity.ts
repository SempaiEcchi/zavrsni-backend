import {
    AfterLoad,
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";
import {IndustryEntity} from "./industries.entity.js";
import {MediaEntity} from "./media.entity.js";
import {Point} from "geojson";
import {UserEntity} from "./user.entity.js";

@Entity()
@Index(["id", "user_id"], {unique: true})
export class CompanyEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({unique: true, nullable: true})
    oib: string;

    @Column("timestamp with time zone", {
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;

    @Column()
    name: string;

    @Column({default: ""})
    email: string;

    @Column({default: ""})
    representative: string;

    @Column({default: false})
    isGreen: boolean;

    rating: number;

    @Column({default: ""})
    description: string;

    @AfterLoad()
    async setRating() {
        // random number 4-5
        this.rating = 4 + Math.random();
    }

    @Column({default: 0})
    open_positions: number;

    @Column({nullable: true})
    phone_number: string;

    @Column({nullable: true})
    logoUrl: string;

    @AfterLoad()
    afterLoad() {
        if (this.logo) {
            this.logoUrl = this.logo.url;
        }
    }

    @OneToOne(() => MediaEntity, {eager: true, onDelete: "SET NULL"})
    @JoinColumn({name: "logo_id"})
    logo: MediaEntity;

    @Column({nullable: true})
    logo_id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: "user_id"})
    user: Relation<UserEntity>;

    @Column({default: "ajonGFmygMPpyzhfjIaxD2IoVhi2"})
    user_id: string;
    

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

    @Column({nullable: true})
    industryId: number;

    @ManyToOne(() => IndustryEntity)
    @JoinColumn({name: "industryId"})
    industry: Relation<IndustryEntity>;

    @OneToMany(
        () => JobOpportunityEntity,
        (jobOpportunities) => jobOpportunities.jobProfile,
    )
    opportunities: Relation<JobOpportunityEntity[]>;
}

export class SimpleCompany {
    id: number;
    name: string;
    rating: number;
    open_positions: number;
    logoUrl: string;
    isGreen: boolean;

    constructor(company: CompanyEntity) {
        this.id = company.id;
        this.name = company.name;
        this.rating = company.rating;
        this.open_positions = company.open_positions;
        this.logoUrl = company.logo.url ?? company.logoUrl;
        this.isGreen = company.isGreen;
    }
}
