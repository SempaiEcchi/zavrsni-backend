import {
    CallHandler,
    CanActivate,
    ConflictException,
    DynamicModule,
    ExecutionContext,
    Global,
    Injectable,
    Module,
    NestInterceptor,
    UnauthorizedException,
} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";

import {Observable} from "rxjs";
import {Locker} from "../../common/locker.js";
import {UserService} from "./user.service.js";
import {UserType} from "../../models/user.entity.js";
import logger from "../../logger.js";
import {
    DecodedIdToken,
    FIREBASE_AUTH_CONFIG,
    FirebaseAuthConfig,
    FirebaseAuthGuard,
    FirebaseStrategy,
} from "../../middleware/firebase_passport/index.js";

@Global()
@Module({})
export class CustomFirebaseAuthModule {
    static register(firebaseAuthConfig: FirebaseAuthConfig): DynamicModule {
        return {
            module: CustomFirebaseAuthModule,
            imports: [PassportModule.register({defaultStrategy: "firebase"})],
            providers: [
                {
                    provide: FIREBASE_AUTH_CONFIG,
                    useValue: firebaseAuthConfig,
                },
                FirebaseCustomStrategy,
            ],
            exports: [PassportModule, FirebaseCustomStrategy, FIREBASE_AUTH_CONFIG],
        };
    }
}

@Injectable()
class FirebaseCustomStrategy extends FirebaseStrategy {
    constructor() {
        super({
            audience: "firmus-jobs",
            issuer: "https://securetoken.google.com/firmus-jobs",
        });
    }

    async validate(payload: DecodedIdToken): Promise<any> {
        return payload;
    }
}

@Injectable()
export class FirebaseEmailVerified implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        if (!request.user.email_verified) {
            throw new UnauthorizedException("Email not verified");
        }

        return true;
    }
}

@Injectable()
export class IsAdminGuard implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const firebase_id = request?.user?.user_id?.toString();
        const user = await this.userService.findOneUser(firebase_id);

        if (user.type !== UserType.ADMIN) {
            throw new UnauthorizedException("Not an admin");
        }
        return true;

    }
}

@Injectable()
export class ValidateStudent implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        console.time("ValidateStudent" + request.url);

        const firebase_id = request?.user?.user_id?.toString();
        let student_id = await this.userService.getStudentIdFromUserId(firebase_id);
        console.timeEnd("ValidateStudent" + request.url);

        // if (!student_id) throw new UnauthorizedException("Student not found");
        if (!student_id)
            student_id = (await this.userService.createAnonymousStudent(firebase_id))
                .id;

        request.student_id = student_id;
        return true;
    }
}

@Injectable()
export class ValidateCompany implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        console.time("ValidateCompany");

        const firebase_id = request?.user?.user_id?.toString();
        let company_id = await this.userService.getCompanyIdFromUserId(firebase_id);
        console.timeEnd("ValidateCompany");

        //  if (request.params.company_id) {
        //   if (+request.params.company_id !== company_id) {
        //     throw new UnauthorizedException("Cannot get other company's data");
        //   }
        // }

        request.company_id = company_id;
        return true;
    }
}

@Injectable()
export class ResolveStudent implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const firebase_id = request?.user?.user_id?.toString();

        let student = await this.userService.findOneStudentByUserId(firebase_id);
        if (!student) {
            throw new UnauthorizedException("Student not found");
        }

        if(student.isDeleted){
            throw new UnauthorizedException("Student is deleted");
        }

        request.student = student;

        return true;
    }
}

const lockerService = new Locker();

@Injectable()
export class LockInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        if (!request?.user) {
            return next.handle();
        }

        const key = request?.user?.user_id?.toString() + request.url;
        if (lockerService.isLocked(key)) {
            throw new ConflictException("Already processing");
        }
        lockerService.lock(key);
        return next.handle().pipe((data) => {
            lockerService.releaseLock(key);
            return data;
        });
    }
}


export const strictGuards = [
    FirebaseAuthGuard,
    FirebaseEmailVerified,
    ValidateStudent,
];

export const strictGuardsCompany = [
    FirebaseAuthGuard,
    // FirebaseEmailVerified,
    ValidateCompany,
];
export const basicAuthGuards = [FirebaseAuthGuard];
