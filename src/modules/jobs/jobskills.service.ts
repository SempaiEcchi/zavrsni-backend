import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {JobSkillsEntity} from "../../models/jobSkills.entity.js";
import logger from "../../logger.js";

@Injectable()
export class JobSkillsService {
    constructor(
        @InjectRepository(JobSkillsEntity)
        private industryEntityRepository: Repository<JobSkillsEntity>,
    ) {
    }

    async createJobSkills(dto: CreateJobSkillDTO, user_id: string) {
        const entity = new JobSkillsEntity();
        entity.name = dto.name;
        entity.created_by_user_id = user_id;
        try {
            const jobSkills = await this.industryEntityRepository.save(entity);
        } catch (error) {
            logger.info(error);
        }

        return this.getJobSkills();
    }

    async getJobSkills(): Promise<JobSkillsEntity[]> {
        return this.industryEntityRepository.find();
    }
}

export class CreateJobSkillDTO {
    name: string;
}
