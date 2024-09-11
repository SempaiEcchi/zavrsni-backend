import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "./modules/users/user.module.js";
import {CustomFirebaseAuthModule} from "./modules/users/auth.module.js";
import {CommonModule} from "./common/common.module.js";
import {MediaModule} from "./modules/media/media.module.js";
import {JobsModule} from "./modules/jobs/jobs.module.js";
import {ChatModule} from "./chat/chat.module.js";
import {NotificationsModule} from "./modules/notifications/notifications.module.js";
import {WaitlistModule} from "./waitlist/waitlist.module.js";
import {VideoParserModule} from "./modules/video_parser/video_parser.module.js";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {ThrottlerModule} from "@nestjs/throttler";
import {LocationsModule} from "./modules/locations/locations.module.js";
import {MailModule} from "./modules/mail/mail.module.js";

const __dirname = new URL(".", import.meta.url).pathname;

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "client"),
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        ConfigModule.forRoot({
            envFilePath: [".env"],
            // envFilePath: process.env.NODE_ENV === "dev" ? [".dokku.env"] : [".env"],
            isGlobal: true,
        }),
        CustomFirebaseAuthModule.register({
            audience: "firmus-jobs",
            issuer: "https://securetoken.google.com/firmus-jobs",
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                return {
                    type: "postgres",

                    // dropSchema: true,
                    // migrationsRun: true,
                    synchronize: true,

                    poolSize: configService.get("NODE_ENV") == "dev" ? 10 : 200,

                    url: configService.get("DATABASE_URL"),
                    migrations: ["dist/migrations/*{.ts,.js}"],
                    // ssl:
                    //   configService.get("DB_SSL_CA") === undefined
                    //     ? false
                    //     : {
                    //         rejectUnauthorized: false,
                    //         ca: configService.get("DB_SSL_CA"),
                    //       },
                    entities: ["dist/models/*.entity{.ts,.js}"],
                    autoLoadEntities: true,
                    logging: ["query", "error"],
                    logger: "file",

                };
            },
            inject: [ConfigService],
        }),

        UsersModule,
        CommonModule,
        MediaModule,
        JobsModule,
        ChatModule,
        NotificationsModule,
        WaitlistModule,
        VideoParserModule,
        LocationsModule,
        MailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
