import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Request,
    UnauthorizedException,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import {UserService} from "./user.service.js";
import {CreateCompanyDTO, CreateCVDTO, CreateStudentDTO, UpdateSelectedJobProfilesDTO,} from "./dto.js";
import {basicAuthGuards, FirebaseEmailVerified, IsAdminGuard, strictGuards,} from "./auth.module.js";
import {StudentEntity} from "../../models/students.entity.js";
import {FirebaseAuthGuard,} from "../../middleware/firebase_passport/index.js";
import {ApiBody, ApiConsumes, ApiExtraModels, ApiTags, getSchemaPath,} from "@nestjs/swagger";
import {Express} from "express";
import {FileFieldsInterceptor, FileInterceptor,} from "@nestjs/platform-express";
import {CompanyEntity} from "../../models/company.entity.js";
import logger from "../../logger.js";
import {AuthService, RegisterDTO} from "./auth.service.js";

@ApiTags("users")
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {
    }


    @Patch("/notifications")
    @UseGuards(...[FirebaseAuthGuard, FirebaseEmailVerified])
    async addNotificationToken(@Body() body: any, @Request() req) {
        await this.userService.addNotificationToken(req.user.user_id, body.token);

        return {};
    }

    @Delete("/notifications")
    @UseGuards(...strictGuards)
    async deleteNotificationToken(@Body() body: any, @Request() req) {
        await this.userService.deleteNotificationToken(req.student_id, body.token);

        return {};
    }

    @Get("/companies")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async getCompanies(@Request() req) {
        return this.userService.getCompanies(req.user.user_id);
    }

    @Get("/delete-anon-students")
    async deleteAnonStudents(@Request() req) {
        //check headers
        if (req.headers.authorization == "admin-del") {
            return this.userService.deleteAnonStudents();
        }
    }

    @Get("/:id")
    @UseGuards(...basicAuthGuards)
    async getUser(@Param() params: { id: string }, @Request() req) {
        if (params.id !== req.user.user_id) {
            throw new UnauthorizedException("Cannot get other user's data");
        }
        const user = await this.userService.findOne(req.user.user_id);

        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user == "admin") {
            return {
                data: {
                    id: params.id,
                    user_type: "admin",
                },
            };
        }
        if (user instanceof StudentEntity) {
            if (user.isDeleted) {
                throw new NotFoundException("User not found");
            }
        }


        return {
            data: {
                ...Object.assign({}, user as StudentEntity | CompanyEntity,),
                user_type: user instanceof StudentEntity ? "student" : "company",
            },
        };
    }

    @Patch("/student/:id")
    @UseGuards(...strictGuards)
    @UseInterceptors(FileFieldsInterceptor([{name: "image", maxCount: 1}]))
    async updateProfileRequest(
        @Param() params: { id: string },
        @Body() updateProfile: any,
        @UploadedFiles()
            files: {
            image?: Express.Multer.File[];
        },
        @Request() req,
    ) {
        if (params.id != req.student_id) {
            throw new UnauthorizedException("Cannot update other user's data");
        }
        const student = await this.userService.updateProfile(
            req.student_id,
            updateProfile,
            {
                profile_picture: files.image?.[0]?.buffer,
            },
        );
        return {data: student};
    }

    @Post("/register")
    // @UseGuards(...basicAuthGuards)
    async register(@Request() req, @Body() body: RegisterDTO) {
        const resp = await this.authService.register("1", body.email);
        return {data: resp};
    }


    @Post("/student")
    @UseInterceptors(
        FileFieldsInterceptor([
            {name: "profile_picture", maxCount: 1},
            {name: "video", maxCount: 1},
            {name: "thumbnail", maxCount: 1},
        ]),
    )
    // @UseGuards(...strictGuards)
    @UseGuards(...basicAuthGuards)
    @ApiConsumes("multipart/form-data")
    @ApiExtraModels(CreateStudentDTO)
    @ApiBody({
        schema: {
            type: "object",
            allOf: [
                {
                    $ref: getSchemaPath(CreateStudentDTO),
                },
                {
                    properties: {
                        profile_picture: {
                            type: "string",
                            format: "binary",
                            nullable: false,
                        },
                        video: {
                            type: "string",
                            format: "binary",
                            nullable: false,
                        },
                        thumbnail: {
                            type: "string",
                            format: "binary",
                            nullable: false,
                        },
                    },
                },
            ],
        },
    })
    async createStudent(
        @Body() createStudent: CreateStudentDTO,
        @Request() req,
        @UploadedFiles()
            files: {
            profile_picture: Express.Multer.File[];
            thumbnail?: Express.Multer.File[];
            video?: Express.Multer.File[];
        },
    ) {
        if (createStudent.anon) {
            const resp = await this.userService.createAnonymousStudent(
                req.user.user_id,
            );
            return {data: resp};
        }
        let resp = await this.userService.createStudent(
                createStudent as CreateStudentDTO,
                req.user.user_id,
                req.user.email,
                {
                    profile_picture: files.profile_picture?.[0]?.buffer,
                    thumbnail: files.thumbnail?.[0]?.buffer,
                    video: files.video?.[0]?.buffer,
                },
            );

        return {data: resp};
    }

    @Post("/is-registered")
    // @UseGuards(...strictGuards)
    @UseGuards(...basicAuthGuards)
    async isRegistered(@Body() isRegistered: any, @Request() req) {
        const resp = await this.userService.getStudentByEmail(isRegistered.email);

        return {
            data: {
                isRegistered: resp !== null,
            },
        };
    }

    @Post("/student/job-profiles")
    @UseGuards(...strictGuards)
    async updateStudentJobProfiles(
        @Body() updateJobProfiles: UpdateSelectedJobProfilesDTO,
        @Request() req,
    ) {
        const student_id = await this.userService.getStudentIdFromUserId(
            req.user.user_id,
        );
        const resp = await this.userService.updateSelectedJobProfiles(
            student_id,
            updateJobProfiles.job_profiles,
        );

        const student = await this.userService.findOneStudent(student_id);

        return {data: student};
    }

    @Post("/company")
    @UseGuards(...strictGuards)
    @UseInterceptors(FileInterceptor("logo"))
    async createCompany(
        @Body() createCompany: CreateCompanyDTO | any,
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (createCompany.fake) {
            const fakeCompany = await this.userService.createFakeCompany(
                req.user.user_id,
            );
            return {
                data: fakeCompany,
            };
        }

        return this.userService
            .createCompany(createCompany, file.buffer, req.user.user_id)
            .then((company) => {
                return {data: company};
            });
    }


    @Post("/admin-company")
    @UseGuards(...basicAuthGuards, IsAdminGuard)
    async createCompanyAdmin(
        @Body() createCompany:
            any,
        @Request() req,
    ) {

        return this.userService
            .createCompanyAdmin(createCompany, req.user.user_id)
            .then((company) => {
                return {data: company};
            });
    }

    @Post("/student/video")
    @UseInterceptors(
        FileFieldsInterceptor([
            {name: "video", maxCount: 1},
            {name: "thumbnail", maxCount: 1},
        ]),
    )
    @ApiConsumes("multipart/form-data")
    @UseGuards(...strictGuards)
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                video: {
                    type: "string",
                    format: "binary",
                    nullable: false,
                },
                thumbnail: {
                    type: "string",
                    format: "binary",
                    nullable: false,
                },
            },
        },
    })
    async uploadVideoCv(
        @Request() req,
        @UploadedFiles()
            files: {
            video: Express.Multer.File[];
            thumbnail: Express.Multer.File[];
        },
    ) {
        const cv = await this.userService.addStudentVideoCV(req.student_id, {
            thumbnail: files.thumbnail?.[0]?.buffer,
            video: files.video?.[0]?.buffer,
        });
        return {data: cv};
    }

    @Patch("/student/video/:id")
    @UseGuards(...strictGuards)
    async updateStudentVideo(
        @Request() req,
        @Param() params: { id: string },
        @Body() body: any,
    ) {
        const cv = await this.userService.updateVideoCV(
            req.student_id,
            +params.id,
            body.job_profiles,
        );
        return {data: cv};
    }

    @Post("/student/video/delete")
    @UseGuards(...strictGuards)
    async deleteVideo(@Body() deleteVideo: any, @Request() req) {
        logger.info("deleteVideo", deleteVideo);
        const cv = await this.userService.deleteVideo(
            req.student_id,
            +deleteVideo.id,
        );
        return {data: cv};
    }

    @Post("location")
    @UseGuards(...strictGuards)
    async updateLocation(@Body() body: any, @Request() req) {
        const student = req.student_id;

        const resp = await this.userService.updateLocation(student, body);
        return {data: resp};
    }

    @Post("student/bio")
    @UseGuards(...strictGuards)
    async updateBio(@Body() body: any, @Request() req) {
        const student = req.student_id;
        const resp = await this.userService.updateBio(student, body);
        return {data: {bio: resp}};
    }

    @Post("student/cv")
    @UseGuards(...strictGuards)
    async updateCv(@Body() body: CreateCVDTO, @Request() req) {
        const student = req.student_id;
        const resp = await this.userService.updateStudentCV(student, body);
        return {data: resp};
    }


    @Post("student/:id/languages")
    @UseGuards(...strictGuards)
    async updateLanguages(@Body() body: any, @Request() req, @Param() params: { id: string }) {
        const student = params.id;
        if (student != req.student_id) {
            throw new UnauthorizedException("Cannot update other user's data");
        }


        const resp = await this.userService.updateLanguages(student, body.languages);
        return {data: resp};
    }


    @Post("/:id/delete-account")
    @UseGuards(...basicAuthGuards)
    async deleteAccount(@Request() req, @Param() params: { id: string }) {

        if (params.id != req.user.user_id) {
            throw new UnauthorizedException("Cannot delete other user's account");

        }

        return this.userService.deleteAccount(req.user.user_id);
    }
}
