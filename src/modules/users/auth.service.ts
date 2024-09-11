import {UserEntity} from "../../models/user.entity.js";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {MailService} from "../mail/mail.service.js";
import {ActionCodeSettings, getAuth} from "firebase-admin/auth";
import {ApiProperty} from "@nestjs/swagger";

export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private mailService: MailService,
    ) {
    }


    async register(user_id, email) {
        const userExists = await this.userRepository.findOne({
            where: {
                email: email,
            }
        })
        if (!userExists) {

            //     actionCodeSettings: ActionCodeSettings(
            //         iOSBundleId: "com.firmusapp.jobs",
            //         androidPackageName: "com.firmusapp.jobs",
            //         androidMinimumVersion: "1",
            //         handleCodeInApp: true,
            //         dynamicLinkDomain: "firmuswork.page.link",
            //         url: "https://firmuswork.page.link",
            // ));


            const actionCodeSettings: ActionCodeSettings = {
                url: 'https://firmuswork.page.link',
                handleCodeInApp: true,
                iOS: {
                    bundleId: 'com.firmusapp.jobs',
                },
                android: {
                    packageName: 'com.firmusapp.jobs',
                    installApp: true,
                    minimumVersion: '1'
                },
                dynamicLinkDomain: 'firmuswork.page.link',
            }


            const link = await getAuth()
                .generateSignInWithEmailLink(email, actionCodeSettings).catch((error) => {
                    console.log(error)
                    console.log(email)
                    return null
                });


            await this.mailService.sendMagicLink(email,link)
        }
    }
}


export class RegisterDTO {
    @ApiProperty()
    email: string;
}