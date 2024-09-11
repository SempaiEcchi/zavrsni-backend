import {PartialType} from "@nestjs/swagger";
import {CreateWaitlistDto} from "./create-waitlist.dto.js";

export class UpdateWaitlistDto extends PartialType(CreateWaitlistDto) {
}
