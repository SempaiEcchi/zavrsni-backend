import {InjectRepository} from "@nestjs/typeorm";

import {Repository} from "typeorm";
import {StudentEntity} from "../../models/students.entity.js";
import {MediaService} from "../media/media.service.js";
import {CompanyEntity} from "../../models/company.entity.js";
import {JobProfileFrequencyEntity} from "../../models/jobProfileFrequency.entity.js";
import {StudentVideoCVEntity} from "../../models/studentVideoCV.entity.js";

export class StudentProfileService {
    constructor(
        @InjectRepository(StudentEntity)
        private studentEntityRepository: Repository<StudentEntity>,
        @InjectRepository(CompanyEntity)
        private companyRepository: Repository<CompanyEntity>,
        @InjectRepository(JobProfileFrequencyEntity)
        private jobProfileFrequencyRepo: Repository<JobProfileFrequencyEntity>,
        @InjectRepository(StudentVideoCVEntity)
        private studentVideoCVRepository: Repository<StudentVideoCVEntity>,
        private readonly mediaService: MediaService,
    ) {
    }
}
