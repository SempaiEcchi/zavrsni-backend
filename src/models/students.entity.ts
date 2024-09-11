import {
    AfterLoad,
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {UserEntity} from "./user.entity.js";
import {MediaEntity} from "./media.entity.js";
import {JobProfileFrequencyEntity} from "./jobProfileFrequency.entity.js";
import {StudentVideoCVEntity} from "./studentVideoCV.entity.js";
import {LocationEntity} from "./location.entity.js";
import {CreateCVDTO} from "../modules/users/dto.js";

@Entity()
@Index(["id", "user_id"], {unique: true})
export class StudentEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @OneToOne(() => UserEntity, {eager: true})
    @JoinColumn({name: "user_id"})
    user: UserEntity;

    @Column({nullable: false, unique: true})
    user_id: string;

    @Column("timestamp with time zone", {
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;

    @Column({default: "ANON"})
    first_name: string;

    @Column({nullable: true})
    last_name: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    email_contact: string;

    @Column({nullable: true})
    bio: string;

    @Column({nullable: false, default: "M"})
    gender: string;

    @Column({nullable: true})
    phone_number: string;

    @Column({nullable: true})
    date_of_birth: Date;

    age: number;

    @AfterLoad()
    async setAge() {
        if (!this.date_of_birth) {
            this.age = 0;
            return;
        }
        const today = new Date();
        const birthDate = new Date(this.date_of_birth);
        this.age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            this.age--;
        }
    }

    private profile_completion_percentage: number;

    @AfterLoad()
    async setProfileCompletion() {
        const props = [
            this.first_name,
            this.last_name,
            this.email,
            this.bio,
            this.cv,
            this.profile_picture,
            this.location,
            this.languages,
            this.phone_number,
            this.studentVideoCVs,
            this.jobProfileFrequencies,
        ];
        const total = props.length;
        let completed = 0;
        props.forEach((prop) => {
            if (prop) {
                completed++;
            }
        });
        this.profile_completion_percentage = completed / total;
    }

    @Column({
        nullable: true,
        type: "jsonb",
    })
    cv: CreateCVDTO;

    @Column({default: false})
    student_email_valid: boolean;
    @OneToOne(() => MediaEntity, {eager: true, onDelete: "SET NULL"})
    @JoinColumn({name: "profile_picture_id"})
    profile_picture: MediaEntity;

    @Column({nullable: true})
    profile_picture_id: number;

    @OneToMany(
        () => StudentVideoCVEntity,
        (studentVideoCV) => studentVideoCV.studentEntity,
        {eager: true, cascade: true},
    )
    studentVideoCVs: StudentVideoCVEntity[];

    @OneToMany(() => JobProfileFrequencyEntity, (jobpf) => jobpf.student, {
        eager: true,
        cascade: true,
    })
    jobProfileFrequencies: Relation<JobProfileFrequencyEntity>[];

    @OneToOne(() => LocationEntity, (entity) => entity.student, {
        eager: true,
        cascade: true,

    })
    location: Relation<LocationEntity>;


    @Column({nullable: true, type: "jsonb"})
    university_info: Relation<UniversityInfo>;

    @Column("text", {
        default: [],
        array: true,
    })
    languages: string[];

    isRegistered() {
        return this.email?.includes("@") ?? false;
    }

    //getter
    get isDeleted() {
        return this.email == "Deleted";
    }

}

export class UniversityInfo {
    uni_year: string;
    uni_name: string;
}

export class SimpleStudent {
    id: number;
    location: string;
    first_name: string;
    last_name: string;
    bio: string;
    imageUrl: string;
    email_contact: string;
    age: number;
    cv: CreateCVDTO;
    video?: StudentVideoCVEntity | any;

    constructor(student: StudentEntity, job_profile_id: number) {
        this.id = student.id;
        this.email_contact = student.email_contact ?? student.email;
        this.age = student.age;
        this.cv = student.cv;
        this.location = "";
        this.first_name = student.first_name;
        this.last_name = student.last_name;
        this.bio = student.bio;
        this.imageUrl = student.profile_picture?.url ?? "";
        if (job_profile_id) {
            this.video = student.studentVideoCVs?.find((video) => video.job_profiles.includes(job_profile_id));
        } else {
            this.video = student.studentVideoCVs[0];
        }
    }
}

export class AppliedApplicant {
    student: SimpleStudent;

    constructor(student: StudentEntity, job_profile_id: number) {
        this.student = new SimpleStudent(student, job_profile_id);
    }
}

export class RecommendedApplicant {
    student: SimpleStudent;

    constructor(student: StudentEntity, job_profile_id: number) {
        this.student = new SimpleStudent(student, job_profile_id);
    }
}
