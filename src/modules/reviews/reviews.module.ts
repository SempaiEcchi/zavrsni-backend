import {Module} from '@nestjs/common';
import {ReviewsService} from './reviews.service.js';
import {ReviewsController} from './reviews.controller.js';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EmploymentRecordEntity} from "../../models/employmentRecord.entity.js";
import {RatingEntity} from "../../models/ratings.entity.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EmploymentRecordEntity,
            RatingEntity,
        ]),
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule {
}
