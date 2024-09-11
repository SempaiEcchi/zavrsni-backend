import {MigrationInterface, QueryRunner} from "typeorm";
import {JobProfilesEntity} from "../models/jobProfiles.entity.js";
import {JobOpportunityEntity, JobType, PaymentOptionType,} from "../models/jobOpportunities.entity.js";
import {IndustryEntity} from "../models/industries.entity.js";
import {Point} from "geojson";
import {CompanyEntity} from "../models/company.entity.js";

export class JobOps1694099114754 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const jobOpportunitiesRepository =
            queryRunner.manager.getRepository(JobOpportunityEntity);
        const companyRepository = queryRunner.manager.getRepository(CompanyEntity);

        const jobProfilesRepository =
            queryRunner.manager.getRepository(JobProfilesEntity);

        const industryRepository =
            queryRunner.manager.getRepository(IndustryEntity);

        const jobOps = await Promise.all([
            this.pietasCreation(
                jobProfilesRepository,
                industryRepository,
                companyRepository,
            ),
            this.dposlovi(
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

    private async dposlovi(jobProfilesRepository, industryRepository, company) {
        const pietasJob = await jobProfilesRepository.findOne({
            where: {name: "Voditelj"},
        });

        const industry = await industryRepository.findOne({
            where: {text: "Marketing"},
        });

        const dposlovi: Partial<CompanyEntity> = {
            name: "DPoslovi",
            industry: industry,
            logoUrl:
                "https://media.licdn.com/dms/image/C4E0BAQEorJGKHyytsw/company-logo_200_200/0/1581527704328?e=2147483647&v=beta&t=YEQqRB1VfAFtN34yFvxZcdOPDmKNL9NIV9jKZBblq7c",
        };
        const dposlovicompan = await company.save(dposlovi);

        const pointObject: Point = {
            type: "Point",
            coordinates: [13.848, 44.866],
        };

        const jobOp: Partial<JobOpportunityEntity> = {
            job_profile_id: pietasJob.id,
            company: dposlovicompan,
            jobTitle: "Voditelj marketinga",
            jobDescription:
                "U potrazi smo za voditeljem marketinga, koji će biti zadužen za promociju naše firme, kao i za vođenje tima. Potrebno je da kandidat ima iskustva u vođenju tima, kao i da je komunikativan i da ima iskustva u marketingu. ",
            shortDescription:
                "U potrazi smo za voditeljem marketinga, koji će biti zadužen za promociju naše firme",
            location: pointObject,
            payment: {
                type: PaymentOptionType.FIXED,
                amount: 1000,
                currency: "EUR",
            },

            url: "https://media.tenor.com/1aNfr0BSFLgAAAAM/staatsloterij-dancing.gif",
            approved: true,
            applyDeadline: new Date(2023, 12, 20),
            workStartDate: new Date(2023, 12, 20),

            jobType: JobType.FULL_TIME,
        };
        return jobOp;
    }

    private async pietasCreation(
        jobProfilesRepository,
        industryRepository,
        company,
    ) {
        const pietasJob = await jobProfilesRepository.findOne({
            where: {name: "Konobar"},
        });

        const industry = await industryRepository.findOne({
            where: {text: "Ugostiteljstvo"},
        });

        const pietasSaveobj = {
            name: "Pietas",
            industry: industry,
            logoUrl: "https://placehold.it/300x300",
        };

        const pietas = await company.save(pietasSaveobj);

        const pointObject: Point = {
            type: "Point",
            coordinates: [13.848, 44.866],
        };

        const jobOp: Partial<JobOpportunityEntity> = {
            jobTitle: "Konobar",
            company: pietas,
            job_profile_id: pietasJob.id,
            jobDescription: "Konobar u restoranu",
            shortDescription: "Konobar",
            location: pointObject,
            payment: {
                type: PaymentOptionType.FIXED,
                amount: 1000,
                currency: "EUR",
            },
            url: "https://media.tenor.com/1aNfr0BSFLgAAAAM/staatsloterij-dancing.gif",
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
