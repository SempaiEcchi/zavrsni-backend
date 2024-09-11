import {ApiProperty} from "@nestjs/swagger";

export class GetJobProfilesDto {
    @ApiProperty()
    limit = 40;
}
