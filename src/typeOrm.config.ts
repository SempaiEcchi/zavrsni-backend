import {DataSource} from "typeorm";
import {config} from "dotenv";
import {ConfigService} from "@nestjs/config";

import * as path from "path";

config();
const configService = new ConfigService();
const __dirname = path.resolve(path.dirname(""));
export default new DataSource({
    type: "postgres",
    // dropSchema: true,
    url: configService.get("DATABASE_URL"),
    migrations: ["dist/migrations/*{.ts,.js}"],
    // ssl: {
    //   rejectUnauthorized: false,
    //   ca: configService.get("DB_SSL_CA"),
    // },
    entities: ["dist/models/**/*.entity{.ts,.js}"],

    synchronize: true,
});
