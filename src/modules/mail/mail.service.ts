import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {


    private client:any = null;


    constructor(
        private readonly configService: ConfigService,
    ) {

    }


    async sendMagicLink(
        email: string,
        link: string,
    ) {

    }
}
