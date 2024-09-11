import {Injectable, NotFoundException, UnauthorizedException,} from "@nestjs/common";
import {UserType} from "../models/user.entity.js";
import {getFirestore} from "firebase-admin/firestore";
import {firestore} from "firebase-admin";
import {SimpleStudent} from "../models/students.entity.js";
import Firestore = firestore.Firestore;
import logger from "../logger.js";

@Injectable()
export class ChatService {
    private firestore: Firestore = getFirestore();
    private cache = new Map();

    async sendMessage(
        chat_id: string,
        message: string,
        type: UserType,
        firebase_user_id: string,
    ): Promise<string> {
        if (!this.cache.has(chat_id)) {
            const chat = await this.firestore.collection("chats").doc(chat_id).get();
            if (chat.exists === false) {
                throw new NotFoundException("Chat does not exist");
            }
            this.cache.set(chat_id, chat.data());
        }

        const chat = this.cache.get(chat_id);

        const comparator =
            type === UserType.STUDENT ? "student_firebase_id" : "company_firebase_id";

        if (chat[comparator] !== firebase_user_id) {
            throw new UnauthorizedException("Cannot send message to chat");
        }

        const receiverFirebaseId =
            type === UserType.STUDENT
                ? chat["company_firebase_id"]
                : chat["student_firebase_id"];

        const sentAt = new Date();

        await this.firestore
            .collection("chats")
            .doc(chat_id)
            .collection("messages")
            .add({
                message: message,
                sender_firebase_id: firebase_user_id,
                sender_type: type,
                sent_at: sentAt,
            });
        const data = {
            last_sent: sentAt,
            last_message: message,
            last_sender_type: type,
        };

        await this.firestore.collection("chats").doc(chat_id).update(data);

        return receiverFirebaseId;
    }

    async createChat(
        student_id: number,
        company_id: number,
        student_firebase_id: string,
        company_firebase_id: string,
        job_opportunity_id: string,
        simple_student: SimpleStudent,
    ) {
        logger.info(
            "creating chat for ",
            student_id,
            company_id,
            job_opportunity_id,
            student_firebase_id,
        );
        simple_student.video = null;
        const docId = `${student_id}-${company_id}-${job_opportunity_id}`;

        const chatOverviewEntity = new ChatOverviewEntity(
            company_id.toString(),
            student_id.toString(),
            job_opportunity_id.toString(),
            docId,
            null,
            null,
            null,
            student_firebase_id,
            company_firebase_id,
        );
        const chat = await this.firestore
            .collection("chats")
            .doc(docId)
            .set(
                {
                    ...chatOverviewEntity.toDoc(),
                    ...(Object.assign({}, simple_student) ?? {}),
                },
                {merge: true},
            );

        return docId;
    }
}

class ChatOverviewEntity {
    // Database IDs
    readonly company_id: string;
    readonly student_id: string;
    readonly job_opportunity_id: string;
    readonly chat_id: string;
    readonly last_sent: Date | null;
    readonly last_message: string | null;
    readonly last_sender_type: UserType | null;
    readonly student_firebase_id: string;
    readonly company_firebase_id: string;

    toDoc() {
        return {
            ...this,
        };
    }

    constructor(
        company_id: string,
        student_id: string,
        job_opportunity_id: string,
        chat_id: string,
        last_sent: Date | null,
        last_message: string | null,
        last_sender_type: UserType | null,
        student_firebase_id: string,
        company_firebase_id: string,
    ) {
        this.company_id = company_id;
        this.job_opportunity_id = job_opportunity_id;
        this.company_firebase_id = company_firebase_id;
        this.student_id = student_id;
        this.chat_id = chat_id;
        this.last_sent = last_sent;
        this.last_message = last_message;
        this.last_sender_type = last_sender_type;
        this.student_firebase_id = student_firebase_id;
    }
}
