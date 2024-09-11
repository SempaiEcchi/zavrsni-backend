import {Injectable} from "@nestjs/common";
import {WaitlistEntity} from "../models/waitlist.entity.js";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateWaitlistDto} from "./dto/create-waitlist.dto.js";
import {getFirestore} from "firebase-admin/firestore";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;

@Injectable()
export class WaitlistService {
    private firestore: Firestore = getFirestore();

    constructor(
        @InjectRepository(WaitlistEntity)
        private waitlistRepository: Repository<WaitlistEntity>,
    ) {
    }

    async create(createWaitlistDto: CreateWaitlistDto) {
        await this.waitlistRepository.save(createWaitlistDto);

        const entity = await this.waitlistRepository.findOne({
            where: {email: createWaitlistDto.email},
        });

        this.firestore
            .collection("waitlist")
            .doc(createWaitlistDto.email)
            .set({
                ...entity,
            });
    }
}
