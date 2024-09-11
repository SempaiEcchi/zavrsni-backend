import {CreateLocationDto} from "./create-location.dto.js";
import {PartialType} from "@nestjs/swagger";

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
}
