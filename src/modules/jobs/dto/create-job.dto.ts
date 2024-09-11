import {ApiProperty} from "@nestjs/swagger";
import {JobType} from "../../../models/jobOpportunities.entity.js";

export class CreateJobDTO {
    @ApiProperty()
    jobTitle: string;
    @ApiProperty()
    jobDescription: string;
    @ApiProperty()
    location: string;
    @ApiProperty()
    hourlyRate: number;
    @ApiProperty()
    applyDeadline: Date;
    @ApiProperty()
    workStartDate: Date;
    @ApiProperty()
    workEndDate?: Date | undefined;
    @ApiProperty()
    jobProfileId: string;
    @ApiProperty({enum: JobType})
    jobType: JobType;
    @ApiProperty()
    employeesNeeded: number;

}
