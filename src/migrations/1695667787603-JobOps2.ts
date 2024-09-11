import {MigrationInterface, QueryRunner} from "typeorm";
import {JobOpportunityEntity, JobType, PaymentOptionType,} from "../models/jobOpportunities.entity.js";
import {CompanyEntity} from "../models/company.entity.js";
import {JobProfilesEntity} from "../models/jobProfiles.entity.js";
import {IndustryEntity} from "../models/industries.entity.js";
import {Point} from "geojson";

export class JobOps21695667787603 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const jobOpportunitiesRepository =
            queryRunner.manager.getRepository(JobOpportunityEntity);
        const companyRepository = queryRunner.manager.getRepository(CompanyEntity);

        const jobProfilesRepository =
            queryRunner.manager.getRepository(JobProfilesEntity);

        const industryRepository =
            queryRunner.manager.getRepository(IndustryEntity);

        const jobOps = await Promise.all([
            this.portir(jobProfilesRepository, industryRepository, companyRepository),
            this.zastitar(
                jobProfilesRepository,
                industryRepository,
                companyRepository,
            ),
        ]);
        await jobOpportunitiesRepository.save(jobOps);


        await queryRunner.query(`
            UPDATE company_entity
            SET open_positions = (SELECT COUNT(*)
                                  FROM job_opportunity_entity
                                  WHERE company_id = company_entity.id)
        `);

        await queryRunner.query(`
            UPDATE job_opportunity_entity
            SET url       = 'https://firmusjobs.fra1.cdn.digitaloceanspaces.com/job_opportunities/2a513908-1f0b-440f-a366-440c13c63495-debugjobTitle1704970113009.mp4',
                "isVideo" = true
        `);

    }

    private async portir(jobProfilesRepository, industryRepository, company) {
        const pietasJob = await jobProfilesRepository.findOne({
            where: {name: "Voditelj"},
        });

        const industry = await industryRepository.findOne({
            where: {text: "Marketing"},
        });

        const dposlovi: Partial<CompanyEntity> = {
            name: "Adria Diesel",
            industry: industry,
            logoUrl:
                "https://www.adriadiesel.hr/templates/adria_en/images/designer/b956e6b9899b1f41de5b0766e654657e_Motori_prva.jpg",
        };
        const dposlovicompan = await company.save(dposlovi);

        const pointObject: Point = {
            type: "Point",
            coordinates: [15.55, 45.49],
        };

        const jobOp: Partial<JobOpportunityEntity> = {
            job_profile_id: pietasJob.id,
            company: dposlovicompan,
            jobTitle: "Portir - noćna smjena",
            jobDescription: "",
            location: pointObject,
            payment: {
                type: PaymentOptionType.FIXED,
                amount: 600,
                currency: "EUR",
            },
            url: "https://media.tenor.com/WaXv3LruAz0AAAAC/security-guard.gif",
            approved: true,
            applyDeadline: new Date(2023, 10, 20),
            workStartDate: new Date(2023, 10, 20),

            jobType: JobType.FULL_TIME,
        };
        return jobOp;
    }

    private async zastitar(jobProfilesRepository, industryRepository, company) {
        const pietasJob = await jobProfilesRepository.findOne({
            where: {name: "Voditelj"},
        });

        const industry = await industryRepository.findOne({
            where: {text: "Marketing"},
        });

        const dposlovi: Partial<CompanyEntity> = {
            name: "Sokol Marić",
            industry: industry,
            logoUrl: "https://bb-partneri.com/build/images/klijenti/sokolmaric.png",
        };
        const dposlovicompan = await company.save(dposlovi);

        const pointObject: Point = {
            type: "Point",
            coordinates: [15.55, 45.49],
        };

        const jobOp: Partial<JobOpportunityEntity> = {
            job_profile_id: pietasJob.id,
            company: dposlovicompan,
            jobTitle: "Zaštitar - berba bobicastog voća",
            jobDescription: "",
            location: pointObject,
            payment: {
                type: PaymentOptionType.FIXED,
                amount: 6000,
                currency: "EUR",
            },

            url: "https://gifdb.com/images/high/croatia-krk-calming-beach-kyhc0d31vtovtkjr.gif",
            approved: true,
            applyDeadline: new Date(2023, 10, 20),
            workStartDate: new Date(2023, 10, 20),

            jobType: JobType.FULL_TIME,
        };
        return jobOp;
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
