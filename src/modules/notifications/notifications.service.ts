import {Injectable} from "@nestjs/common";

import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../../models/user.entity.js";
import {Repository} from "typeorm";
import {getMessaging, Messaging, TokenMessage,} from "firebase-admin/messaging";
import {StudentEntity} from "../../models/students.entity.js";
import {FirmusNotification} from "./firmus.notification.js";
import {SentNotificationEntity} from "../../models/sentNotification.entity.js";
import logger from "../../logger.js";

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(StudentEntity)
        private studentEntityRepository: Repository<StudentEntity>,
        @InjectRepository(UserEntity)
        private userEntityRepository: Repository<UserEntity>,
        @InjectRepository(SentNotificationEntity)
        private sentNotificationEntityRepository: Repository<SentNotificationEntity>,
    ) {
    }

    private fcm: Messaging = getMessaging();

    async sendNotificationToUser(
        user_id: string,
        notification: FirmusNotification,
    ) {
        const user = await this.userEntityRepository
            .createQueryBuilder("user")
            .select("user.notification_tokens")
            .where("user.firebase_uid = :user_id", {user_id})
            .getOne();

        const n = await this.insertSentNotification(notification, user_id);
        const id = n.identifiers[0].id.toString();
        notification.id = id;
        const messages = user.notification_tokens.map((token) => {
            const message: TokenMessage = {
                token: token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: JSON.parse(JSON.stringify(notification.data)),
                apns: {
                    headers: {
                        "apns-priority": "10",
                    },
                    payload: {
                        aps: {
                            alert: {
                                title: notification.title,
                                body: notification.body,
                            },
                            badge: 1,
                            sound: "default",
                        },
                    },
                },
            };
            return message;
        });

        await Promise.all(
            messages.map(async (m) => {
                try {
                    await this.fcm.send(m);
                    logger.info("sent notification to token" + m.token);
                } catch (e) {
                     if (
                        e.errorInfo.code === "messaging/invalid-registration-token" ||
                        e.errorInfo.code === "messaging/registration-token-not-registered"
                    ) {
                        await this.userEntityRepository
                            .createQueryBuilder("user")
                            .update()
                            .set({
                                notification_tokens: () =>
                                    `array_remove(notification_tokens, '${m}')`,
                            })
                            .execute();
                    } else {
                        logger.info(e);
                    }
                }
            }),
        );
    }

    async insertSentNotification(
        notification: FirmusNotification,
        user_id: string,
    ) {
        const sentNotification = new SentNotificationEntity();
        sentNotification.receiver_id = user_id;
        sentNotification.notification = {
            ...notification,
        };
        return this.sentNotificationEntityRepository.insert(sentNotification);
    }

    async fetchNotifications(user_id: string) {
        const notifications = await this.sentNotificationEntityRepository
            .createQueryBuilder("notification")
            .where("notification.receiver_id = :user_id", {user_id})
            .orderBy("notification.id", "DESC")
            .getMany();

        return notifications.map((n) => {
            return n.notification;
        });
    }
}
