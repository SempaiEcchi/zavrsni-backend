import {InjectRepository} from "@nestjs/typeorm";

import {DeepPartial, Repository} from "typeorm";
import {UserEntity, UserType} from "../../models/user.entity.js";
import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {SimpleStudent, StudentEntity} from "../../models/students.entity.js";
import {MediaService} from "../media/media.service.js";
import {UploadedMediaType} from "../../models/media.entity.js";
import {CreateCVDTO, CreateStudentDTO, JobProfileFrequencyDTO, StudentExperience,} from "./dto.js";
import {CompanyEntity, SimpleCompany} from "../../models/company.entity.js";
import {JobProfileFrequencyEntity} from "../../models/jobProfileFrequency.entity.js";
import {StudentVideoCVEntity} from "../../models/studentVideoCV.entity.js";
import {StudentProfileService} from "./student.profile.service.js";
import {LocationEntity} from "../../models/location.entity.js";
import {memoryCache} from "../../common/cache_manager.js";
import {IndustryEntity} from "../../models/industries.entity.js";
import {JobProfilesEntity} from "../../models/jobProfiles.entity.js";
import {LocationsService} from "../locations/locations.service.js";
import logger from "../../logger.js";
import admin from "firebase-admin";

export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(StudentEntity)
        private studentEntityRepository: Repository<StudentEntity>,
        @InjectRepository(CompanyEntity)
        private companyRepository: Repository<CompanyEntity>,
        @InjectRepository(JobProfileFrequencyEntity)
        private jobProfileFrequencyRepo: Repository<JobProfileFrequencyEntity>,
        @InjectRepository(StudentVideoCVEntity)
        private studentVideoCVRepository: Repository<StudentVideoCVEntity>,
        @InjectRepository(LocationEntity)
        private locationRepository: Repository<LocationEntity>,
        private readonly mediaService: MediaService,
        private readonly locationService: LocationsService,
        private readonly studentProfileService: StudentProfileService,
    ) {
    }

    async findOneStudent(student_id: number): Promise<StudentEntity | undefined> {
        return this.studentEntityRepository.findOneBy({id: student_id});
    }

    async getSimpleStudent(user_id: string): Promise<SimpleStudent> {
        const student = await this.studentEntityRepository.findOne({
            where: {user_id: user_id},
            relations: ["profile_picture", "studentVideoCVs"],
        });
        return new SimpleStudent(student, null);
    }

    async getSimpleCompany(user_id: string): Promise<SimpleCompany> {
        const company: CompanyEntity = await this.companyRepository.findOne({
            where: {user_id: user_id},
            relations: ["logo"],
        });
        return new SimpleCompany(company);
    }

    async getSimpleCompanyFromId(company_id: number): Promise<SimpleCompany> {
        const company: CompanyEntity = await this.companyRepository.findOne({
            where: {id: company_id},
            relations: ["logo"],
        });
        return new SimpleCompany(company);
    }

    async findOne(
        user_id: string,
    ): Promise<StudentEntity | CompanyEntity | string | undefined> {
        const user = await this.findOneUser(user_id);
        if (!user) return undefined;

        if (user.type === UserType.STUDENT) {
            return this.findOneStudentByUserId(user_id);
        } else if (user.type === UserType.COMPANY) {
            return this.findOneCompanyByUserId(user_id);
        }
        return "admin";

    }

    async findOneStudentByUserId(
        firebase_user_id: string,
    ): Promise<StudentEntity | undefined> {
        return this.studentEntityRepository.findOne({
            where: {user_id: firebase_user_id},
        });
    }

    async getStudentByEmail(email): Promise<StudentEntity | null> {
        return this.studentEntityRepository.findOneBy({email: email});
    }

    async getStudentIdFromUserId(user_id: string): Promise<number | undefined> {
        const cached = await memoryCache.get("user_id" + user_id);
        if (cached) {
            return +cached;
        }

        const result = await this.studentEntityRepository
            .createQueryBuilder("student")
            .select("student.id")
            .where("student.user_id = :user_id", {user_id})
            .getRawOne();

        if (result?.student_id)
            await memoryCache.set("user_id" + user_id, result?.student_id);

        return memoryCache.get("user_id" + user_id);
    }

    async getUserIdFromStudentId(id: number): Promise<string | undefined> {
        const result = await this.studentEntityRepository
            .createQueryBuilder("student")
            .select("student.user_id")
            .where("student.id = :id", {id})
            .getRawOne();

        return result.student_user_id;
    }

    async getCompanyIdFromUserId(user_id: string): Promise<number | undefined> {
        const cached = await memoryCache.get("company" + user_id);
        if (cached) {
            return +cached;
        }

        const result = await this.companyRepository
            .createQueryBuilder("company")
            .select("company.id")
            .where("company.user_id = :user_id", {user_id})
            .getRawOne();

        if (result?.company_id)
            await memoryCache.set("company" + user_id, result?.company_id);

        return memoryCache.get("company" + user_id);
    }

    async findOneCompanyByUserId(
        user_id: string,
    ): Promise<CompanyEntity | undefined> {
        return this.companyRepository.findOneBy({
            user_id: user_id,
        });
    }

    async findOneCompany(id: number): Promise<CompanyEntity | undefined> {
        return this.companyRepository.findOneBy({
            id: id,
        });
    }

    async findOneUser(id: string): Promise<UserEntity | undefined> {
        return this.usersRepository.findOneBy({firebase_uid: id});
    }


    async createStudent(
        createStudent: CreateStudentDTO,
        firebaseUserId: string,
        email: string,
        files: {
            profile_picture?: Buffer;
            video?: Buffer;
            thumbnail?: Buffer;
        },
    ): Promise<StudentEntity> {
        let existing = await this.findOneUser(firebaseUserId);

        if (existing == null) {
            const user = new UserEntity();
            user.firebase_uid = firebaseUserId;
            user.type = UserType.STUDENT;
            existing = await this.usersRepository.save(user);
        }
        if (existing.type !== UserType.STUDENT) {
            throw new BadRequestException("User is not a student");
        }
        if (existing.firebase_uid != firebaseUserId) {
            throw new UnauthorizedException("User does not match Auth id");
        }
        if (!email) {
            throw new BadRequestException("Email is required");
        }

        let student = await this.findOneStudentByUserId(firebaseUserId);

        student = student ?? new StudentEntity();
        student.user_id = existing.firebase_uid ?? firebaseUserId;
        student.email = email;
        student.date_of_birth = createStudent.date_of_birth;
        student.phone_number = createStudent.phone_number;

        if (createStudent.university_info) {
            student.university_info = createStudent.university_info;
        }


        if (createStudent.city && createStudent.city != "Ostalo") {

            const location = await this.locationService.getLocationFromCityName(createStudent.city);
            logger.info("Location is ", location)
            if (location) {
                const locationEntity = student.location ?? new LocationEntity();
                locationEntity.location = {
                    type: "Point",
                    coordinates: [location.lng, location.lat],
                };
                locationEntity.location_name = createStudent.city;
                student.location = locationEntity;
                logger.info("Location entity is ", locationEntity)
            }

        }
        student.first_name = createStudent.first_name;
        student.last_name = createStudent.last_name;
        student.email = email;


        if (files.profile_picture) {
            await this.updateStudentProfilePicture(student, files.profile_picture);
        }

        if (files.video && files.thumbnail) {
            // we are deleting all previous videos
            await this.deleteVideoCVs(student.id);

            await this.addStudentVideoCV(student.id, {
                thumbnail: files.thumbnail,
                video: files.video,
            });
        }

        if (createStudent.job_profiles) {
            await this.updateSelectedJobProfiles(
                student.id,
                createStudent.job_profiles,
            );
        }
        if (createStudent.cv) {
            await this.updateStudentCV(student.id, createStudent.cv);
        }
        await student.reload();
        return student;
    }

    async updateProfile(
        student_id,
        updateProfile: Partial<CreateStudentDTO>,
        files: {
            profile_picture?: Buffer;
        },
    ) {
        let student = await this.findOneStudent(student_id);
        if (files.profile_picture) {
            student = await this.updateStudentProfilePicture(
                student,
                files.profile_picture,
            );
        }

        const entity = {
            id: student_id,
            ...Object.assign({}, student),
            ...Object.assign({}, updateProfile),
        } as DeepPartial<StudentEntity>

        await this.studentEntityRepository.save(entity);

        student = await this.findOneStudent(student_id);

        return student;
    }


    async createCompany(createCompany: object, logo: Buffer, userId: string) {
        let existing = await this.findOneUser(userId);
        if (!existing) {
            existing = new UserEntity();
        }
        existing.firebase_uid = userId;
        existing.type = UserType.COMPANY;
        existing = await this.usersRepository.save(existing);

        let company = await this.findOneCompanyByUserId(userId);

        if (true) {
            let shouldCreate = !company || existing.type === UserType.ADMIN;

            logger.info("allowing to create company, remove in prod");
            shouldCreate = true;

            if (shouldCreate) {
                company = company ?? new CompanyEntity();
            }
            company.representative = createCompany["representative"];
            company.description = createCompany["description"];
            company.industryId = +createCompany["industryId"];
            company.name = createCompany["name"];
            company.email = createCompany["email"];
            // company.location = createCompany["location"];
            company.oib = createCompany["oib"];
            const dp = await this.mediaService.uploadPublicFile(
                logo,
                company.name.toString() + Date.now().toString() + ".png",
                "company_logo",
                UploadedMediaType.IMAGE,
            );

            company.logo_id = dp.id;
            company.logoUrl = dp.url;
            company.user_id = existing.firebase_uid;
            return this.companyRepository.save(company);
        }
        throw new BadRequestException("User is not a company");
    }

    async updateSelectedJobProfiles(
        student_id: number,
        updateJobProfiles: JobProfileFrequencyDTO[],
    ): Promise<JobProfileFrequencyEntity[]> {
        const mapped = updateJobProfiles
            .map((job_profile) => {
                const jobProfileFrequency = new JobProfileFrequencyEntity();
                jobProfileFrequency.job_profile_id = job_profile.id;
                jobProfileFrequency.frequency = job_profile.frequency;
                jobProfileFrequency.student_id = +student_id;
                return jobProfileFrequency;
            })
            .filter((jobProfileFrequency) => jobProfileFrequency.frequency > 0);

        await this.jobProfileFrequencyRepo.query(
            "DELETE FROM job_profile_frequency_entity WHERE student_id = $1",
            [parseInt(student_id.toString())],
        );
        return await this.jobProfileFrequencyRepo.save(mapped);
    }

    async deleteVideoCVs(student_id: number) {
        const obj = await this.studentVideoCVRepository.find({
            where: {student_id: student_id},
        });

        await Promise.all(
            obj.map(async (video) => {
                await this.studentVideoCVRepository.delete(video.id);
                await this.mediaService.deleteMedia(video.video.id);
            }),
        );
    }

    async updateStudentProfilePicture(student: StudentEntity, image: Buffer) {
        if (student.profile_picture) {
            await this.mediaService.deleteMedia(student.profile_picture_id);
        }

        student.profile_picture = null;

        const dp = await this.mediaService.uploadPublicFile(
            image,
            student.user_id.toString() + ".png",
            "profile_pictures",
            UploadedMediaType.IMAGE,
        );
        student.profile_picture_id = dp.id;
        student.profile_picture = dp;
        logger.info("Updated image", dp)

        const updatedStudent = await this.studentEntityRepository.save(student);
        return updatedStudent;
    }

    async addStudentVideoCV(
        student_id: number,
        files: {
            thumbnail: Buffer;
            video: Buffer;
        },
    ): Promise<StudentVideoCVEntity> {
        const timestamp = new Date().getTime().toString();

        const [video_cv, thumbnail_entity] = await Promise.all([
            this.mediaService.uploadPublicFile(
                files.video,
                `${student_id}${timestamp}.mp4`,
                "video_cv",
                UploadedMediaType.VIDEO,
            ),
            this.mediaService.uploadPublicFile(
                files.thumbnail,
                `${student_id}${timestamp}.png`,
                "video_cv",
                UploadedMediaType.VIDEO,
            ),
        ]);

        const studentVideoCV = new StudentVideoCVEntity();
        studentVideoCV.student_id = student_id;
        studentVideoCV.video = video_cv;
        studentVideoCV.thumbnail = thumbnail_entity;

        return this.studentVideoCVRepository.save(studentVideoCV);
    }

    async updateStudentCV(
        student_id: number,
        cv: CreateCVDTO,
    ): Promise<StudentExperience[]> {
        await this.studentEntityRepository
            .createQueryBuilder()
            .update()
            .set({cv: cv})
            .where("id = :id", {id: student_id})
            .execute();

        return cv.experiences;
    }

    async updateLocation(student_id: number, body: any): Promise<LocationEntity> {
        const locationEntity = new LocationEntity()
        locationEntity.location = {
            type: "Point",
            coordinates: [body.lng, body.lat],
        };
        locationEntity.location_name = body.location_name;
        locationEntity.student_id = student_id;
        const entity: DeepPartial<StudentEntity> = ({
            id: student_id,
            location: locationEntity
        });

        await this.locationRepository.delete(
            {
                student_id: student_id
            }
        )
        await this.studentEntityRepository.save(entity);

        return locationEntity;
    }

    async deleteVideo(student_id: number, video_id: number) {
        let videos = await this.studentVideoCVRepository.find({
            where: {student_id: student_id},
            relations: [],
        });

        const video = videos.find((video) => video.id == video_id);
        if (video) {
            await this.studentVideoCVRepository.delete(video_id);
            await this.mediaService.deleteMedia(video.video.id);
            await this.mediaService.deleteMedia(video.thumbnail.id);
            videos = videos.filter((video) => video.id != video_id);
        }

        return videos;
    }

    async updateBio(student_id: number, body: any) {
        await this.studentEntityRepository.update(student_id, {bio: body.bio});
        return body.bio;
    }

    async createAnonymousStudent(firebase_id: string): Promise<StudentEntity> {
        let userEntity = await this.usersRepository.findOneBy({
            firebase_uid: firebase_id,
        });

        if (userEntity?.type == UserType.STUDENT) {
            return this.findOneStudentByUserId(firebase_id);
        }


        userEntity = userEntity ?? new UserEntity();
        userEntity.firebase_uid = firebase_id;
        userEntity.type = UserType.STUDENT;
        userEntity = await this.usersRepository.save(userEntity);
        const existingStudent = await this.findOneStudentByUserId(firebase_id);

        if (existingStudent) {
            return existingStudent;
        }
        const student = new StudentEntity();
        student.user_id = userEntity.firebase_uid;
        student.first_name = "Anonymous";
        student.last_name = "";
        // student.email = userEntity.firebase_uid + "@test.unipu.hr";
        // student.email_contact = userEntity.firebase_uid + "@test.unipu.hr";

        return this.studentEntityRepository.save(student);
    }

    makeUnique(arr: string[]) {
        const uniqueArray: string[] = [];
        const comparator = (a: string, b: string) => {
            return a === b;
        };
        for (const item of arr) {
            if (!uniqueArray.some((uniqueItem) => comparator(item, uniqueItem))) {
                uniqueArray.push(item);
            }
        }
        return uniqueArray;
    }

    async addNotificationToken(id, token) {
        const user = await this.findOneUser(id);
        if (user) {
            user.notification_tokens = user.notification_tokens ?? [];
            user.notification_tokens.push(token);
            user.notification_tokens = this.makeUnique(user.notification_tokens);
            await this.usersRepository.save(user);
        }
    }

    async deleteNotificationToken(id, token) {
        const user = await this.findOneUser(id);
        if (user) {
            // remove token from array
            user.notification_tokens = user.notification_tokens.filter(
                (t) => t !== token,
            );
            user.notification_tokens = this.makeUnique(user.notification_tokens);

            await this.usersRepository.save(user);
        }
    }

    async createFakeCompany(user_id: string) {
        var user = await this.findOneUser(user_id);
        if (!user) {
            user = new UserEntity();
            user.firebase_uid = user_id;
        }
        user.type = UserType.COMPANY;
        user = await this.usersRepository.save(user);

        const exists = await this.findOneCompanyByUserId(user_id);

        if (exists) return exists;

        var company = new CompanyEntity();

        company.user_id = user_id;
        company.name = "Fake Company" + Math.random();
        company.location = {
            type: "Point",
            coordinates: [
                24.941024780273438 + Math.random() * 0.1,
                60.16960144042969 + Math.random() * 0.1,
            ],
        };
        company.logoUrl = `https://source.unsplash.com/random/300x200?sig=${~~(
            Math.random() * 1000
        )}`;
        company.industry = await IndustryEntity.findOneBy({
            id: 1,
        });

        company = await company.save();

        return company;
    }

    deleteAnonStudents() {
        //delete where email is empty and created at is older than 1 month
        return this.studentEntityRepository
            .createQueryBuilder()
            .delete()
            .where("email = '' AND created_at < NOW() - INTERVAL '1 month'")
            .execute();
    }

    async updateVideoCV(student_id, id: number, job_profiles: number[]) {
        const videoCV = await this.studentVideoCVRepository.findOne({
            where: {student_id: student_id, id: id},
            relations: ["jobProfiles"],
        });

        if (!videoCV) {
            throw new BadRequestException("Video CV not found");
        }
        if (videoCV.student_id !== student_id) {
            throw new UnauthorizedException("Cannot update other user's data");
        }

        videoCV.jobProfiles = job_profiles.map((id) => {
            return {id} as JobProfilesEntity;
        });

        await videoCV.save();
        await videoCV.reload();
        return videoCV;
    }

    getCompanies(user_id) {
        return this.companyRepository.find(
            {
                where: {
                    user_id: user_id,
                },
            },
        );
    }

    async createCompanyAdmin(createCompany: any, user_id) {
        const company = new CompanyEntity();
        company.name = createCompany.name;
        company.email = createCompany.email;
        company.user_id = user_id;

        const location = await this.locationService.getLocationFromCityName(createCompany.location_name);
        company.location = {
            type: "Point",
            coordinates: [location.lng, location.lat],
        }
        company.location_name = createCompany.city;
        company.oib = createCompany.oib;
        company.industryId = createCompany.industryId;

        const buffer = Buffer.from(createCompany.logo, "base64");

        const logo = await this.mediaService.uploadPublicFile(
            buffer,
            company.name.toString() + Date.now().toString() + ".png",
            "company_logo",
            UploadedMediaType.IMAGE,
        )
        company.logo = logo;
        company.representative = createCompany.representative;


        return this.companyRepository.save(company);

    }

    async updateLanguages(student_id: string, languages: string[]) {
        return this.studentEntityRepository.update({id: +student_id}, {languages: languages ?? []});
    }

    async deleteAccount(user_id: string) {
        const account = await this.findOne(user_id);
        if (account == "admin") {
            throw new UnauthorizedException("Cannot delete admin account");
        }
        if (account instanceof StudentEntity) {
            const timestamp = new Date().getTime().toString();
            account.first_name = `Deleted_${timestamp}`;
            account.last_name = `Student_${timestamp}`;
            account.email = "Deleted";
            account.location = null;
            await this.mediaService.deleteMedia(account.profile_picture_id);
            account.phone_number = "";
            account.email_contact = "";
            account.cv = null;
            await account.save();
            await admin.auth().updateUser(user_id, {
                disabled: true
            });
        } else {
            //todo: implement company deletion
            // await this.companyRepository.delete({user_id: user_id});
        }


    }


}
