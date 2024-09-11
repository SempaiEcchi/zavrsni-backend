import {MigrationInterface, QueryRunner} from "typeorm";
import {JobSkillsEntity} from "../models/jobSkills.entity.js";

export class JobSkillsSeed1701650611290 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const repository = queryRunner.manager.getRepository(JobSkillsEntity);

        const vjestine = [
            "🍳 Rad u kuhinji",
            "🔍 Pedantnost",
            "🍽 Konobarenje",
            "💻 Rad na računalu",
            "😊 Ljubaznost",
            "🤝 Timski rad",
            "🗂 Organizacijske vještine",
            "🗣 Komunikacijske vještine",
            "🔍 Analitičko razmišljanje",
            "🎨 Kreativnost",
            "⏰ Upravljanje vremenom",
            "📊 Proučavanje tržišta",
            "💬 Pregovaračke vještine",
            "🧠 Emocionalna inteligencija",
            "🔍 Istraživačke vještine",
            "⏳ Strpljenje",
            "🚶‍♂️ Samostalnost",
            "🔄 Prilagodljivost",
            "🚀 Upornost",
            "💰 Financijska pismenost",
            "📅 Vođenje sastanaka",
            "🎤 Javno govorenje",
            "💻 Web razvoj",
            "📈 Analiza podataka",
            "🎨 Grafički dizajn",
            "🌐 Strani jezici",
            "🤝 Pružanje podrške korisnicima",
            "📈 Upravljanje projektima",
        ];
        const skillsEntity = vjestine.map((vjestina) => {
            const entity = new JobSkillsEntity();
            entity.name = vjestina;
            return entity;
        });

        await repository.save(skillsEntity);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
