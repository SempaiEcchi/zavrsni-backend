import {MigrationInterface, QueryRunner} from "typeorm";
import {JobProfilesEntity} from "../models/jobProfiles.entity.js";

const seededJobProfiles = [
    {
        name: "Konobar",
        emoji: "🍽️",
    },
    {
        name: "Kuhar",
        emoji: "👨‍🍳",
    },
    {
        name: "Recepcionar",
        emoji: "👨‍💼",
    },
    {
        name: "Animator",
        emoji: "🤹",
    },
    {
        name: "Spa terapeut",
        emoji: "💆",
    },
    {
        name: "Voditelj",
        emoji: "🚗",
    },
    {
        name: "Čistač/ica",
        emoji: "🧹",
    },
    {
        name: "Učitelj/ica",
        emoji: "👩‍🏫",
    },
    {
        name: "Fotograf",
        emoji: "📸",
    },
    {
        name: "Programer/ka",
        emoji: "💻",
    },
    {
        name: "Frizer/ka",
        emoji: "💇",
    },
    {
        name: "Prodavač/ica",
        emoji: "🛍️",
    },
    {
        name: "Novinar/ka",
        emoji: "📰",
    },
    {
        name: "Bibliotekar/ka",
        emoji: "📚",
    },
    {
        name: "Građevinski radnik/ca",
        emoji: "🏗️",
    },
    {
        name: "Električar/ka",
        emoji: "⚡",
    },
    {
        name: "Krovopokrivač/ica",
        emoji: "🏠",
    },
    {
        name: "Vodoinstalater/ka",
        emoji: "🚰",
    },
    {
        name: "Stolac/ka",
        emoji: "🔨",
    },
    {
        name: "Keramičar/ka",
        emoji: "🍶",
    },
    {
        name: "Moler/ka",
        emoji: "🎨",
    },
    {
        name: "Parketar/ka",
        emoji: "🌳",
    },
    {
        name: "Vozač/ica",
        emoji: "🚛",
    },
    {
        name: "Mehaničar/ka",
        emoji: "🔧",
    },
    {
        name: "Autolimar/ka",
        emoji: "🚗",
    },
    {
        name: "Slastičar/ka",
        emoji: "🍰",
    },
    {
        name: "Konditor/ka",
        emoji: "🍩",
    },
    {
        name: "Pizza majstor/ica",
        emoji: "🍕",
    },
    {
        name: "Barmen/ka",
        emoji: "🍹",
    },
    {
        name: "Barista",
        emoji: "☕",
    },
];

export class JobProfiles1687636055490 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const repo = queryRunner.manager.getRepository(JobProfilesEntity);

        await repo.save(seededJobProfiles);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
