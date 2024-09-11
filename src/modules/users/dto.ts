import {ApiProperty} from "@nestjs/swagger";
import {Relation} from "typeorm";
import {UniversityInfo} from "../../models/students.entity.js";

export class JobProfileFrequencyDTO {
    @ApiProperty()
    id: number;
    @ApiProperty()
    frequency: number;
}

export class UpdateSelectedJobProfilesDTO {
    @ApiProperty({type: JobProfileFrequencyDTO, isArray: true})
    job_profiles: JobProfileFrequencyDTO[];
}

export class StudentExperience {
    @ApiProperty()
    jobTitle: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    companyName: string;
    @ApiProperty()
    start: Date;
    @ApiProperty()
    end: Date;
    @ApiProperty()
    acquiredSkills: string[];
}

export class CreateCVDTO {
    @ApiProperty({type: [StudentExperience]})
    experiences: StudentExperience[];
}

export class CreateStudentDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    first_name: string;
    @ApiProperty()
    last_name: string;
    @ApiProperty()
    phone_number: string;
    @ApiProperty()
    date_of_birth: Date;
    // @ApiProperty({ title: "Form Data image" })
    // image: File;
    // @ApiProperty({ title: "Form Data video" })
    // video: File;
    // @ApiProperty({ title: "Form Data video thumbnail" })
    // thumbnail: File;
    @ApiProperty({
        title: "Pair of (job profile id , frequency)",
        type: JobProfileFrequencyDTO,
        isArray: true,
    })
    job_profiles: JobProfileFrequencyDTO[];
    @ApiProperty({title: "Student CV", type: CreateCVDTO})
    cv: CreateCVDTO;

    @ApiProperty()
    city: string | undefined;
    @ApiProperty()
    location: string | undefined;

    @ApiProperty()
    university_info: Relation<UniversityInfo> | undefined;

    anon: boolean|undefined;
}

export class CreateCompanyDTO {
    email: string;
    name: string;
    logo: string;
    industryId: string;
    description: string;
    location: string;
    representative: string;
}
