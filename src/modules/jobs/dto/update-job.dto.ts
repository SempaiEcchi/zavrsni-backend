import {PartialType} from "@nestjs/swagger";
import {CreateJobDTO} from "./create-job.dto.js";

export class UpdateJobDto extends PartialType(CreateJobDTO) {
}
