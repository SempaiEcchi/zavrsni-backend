import {NestFactory, Reflector} from "@nestjs/core";
import {AppModule} from "./app.module.js";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as process from "process";
import {json} from "express";
// import { json } from "express";
import admin from "firebase-admin";
import {ClassSerializerInterceptor} from "@nestjs/common";
import {TransformInterceptor} from "./modules/response-wrapper.js";
import * as basicAuth from "express-basic-auth";
import logger from "./logger.js";

const serviceAccount = "./serviceAccountKey.json";

const VIDEO_SIZE_LIMIT = 300 * 1024 * 1024;

async function bootstrap() {

    await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://firmus-jobs.firebaseio.com",
    });

    const app = await NestFactory.create(AppModule);
    app.use(json({limit: "300mb"}));
    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    });
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalInterceptors(new TransformInterceptor());
    const config = new DocumentBuilder()
        .setTitle("Firmus")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    app.use(
        ["/api", "/metrics"],
        basicAuth.default({
            challenge: true,
            users: {
                leo: "admin",
            },
        }),
    );

    SwaggerModule.setup("api", app, document);

    await app.listen(parseInt(process.env.PORT) || 3000, "0.0.0.0");
    logger.info(`Application is running on ${await app.getUrl()}`);

}

bootstrap();
