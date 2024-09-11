import {Injectable} from '@nestjs/common';
import {CreateReviewDto} from './dto/create-review.dto.js';
import {UpdateReviewDto} from './dto/update-review.dto.js';
import {RatingEntity} from "../../models/ratings.entity.js";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class ReviewsService {

    constructor(
        @InjectRepository(RatingEntity)
        private ratingsRepo: Repository<RatingEntity>,
    ) {
    }

    findAll(company_id: number) {
        return this.ratingsRepo.find({
            where: {
                employment_record: {
                    company_id: company_id
                }
            },
        });

    }


    create(createReviewDto: CreateReviewDto) {

        return `This action adds a new review`;

    }


    findOne(id: number) {
        return `This action returns a #${id} review`;
    }

    update(id: number, updateReviewDto: UpdateReviewDto) {
        return `This action updates a #${id} review`;
    }

    remove(id: number) {
        return `This action removes a #${id} review`;
    }
}
