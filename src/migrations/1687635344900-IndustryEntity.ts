import {MigrationInterface, QueryRunner} from "typeorm";
import {IndustryEntity} from "../models/industries.entity.js";
import {UserEntity, UserType} from "../models/user.entity.js";

const seededJobIndustries = [
    {
        text: "Ugostiteljstvo",
    },
    {
        text: "Turizam",
    },
    {
        text: "Trgovina",
    },
    {
        text: "Mediji",
    },
    {
        text: "Marketing",
    },
    {
        text: "IT",
    },
];

export class IndustryEntity1687635344900 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        const repou = queryRunner.manager.getRepository(UserEntity);
        const admin = new UserEntity();
        admin.firebase_uid = "ajonGFmygMPpyzhfjIaxD2IoVhi2";
        admin.type = UserType.ADMIN;
        await repou.save(admin);

        const repo = queryRunner.manager.getRepository(IndustryEntity);
        await repo.save(seededJobIndustries);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
