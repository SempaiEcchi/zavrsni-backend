import {CompanyEntity} from "./company.entity.js";
import {ResourceWithOptions} from "adminjs";
import {IndustryEntity} from "./industries.entity.js";
import {MatchEntity} from "./match.entity.js";
import {JobOpportunityEntity} from "./jobOpportunities.entity.js";
import {JobProfileFrequencyEntity} from "./jobProfileFrequency.entity.js";
import {JobProfilesEntity} from "./jobProfiles.entity.js";
import {MediaEntity} from "./media.entity.js";
import {RatingEntity} from "./ratings.entity.js";
import {StudentEntity} from "./students.entity.js";
import {StudentVideoCVEntity} from "./studentVideoCV.entity.js";
import {UserEntity} from "./user.entity.js";
import {JobSkillsEntity} from "./jobSkills.entity.js";
import {WaitlistEntity} from "./waitlist.entity.js";
import {SentNotificationEntity} from "./sentNotification.entity.js";
import {EmploymentRecordEntity} from "./employmentRecord.entity.js";
import {injectManyToManySupport} from "../common/admin/hooks/many-to-many.hook.js";
import {LocationEntity} from "./location.entity.js";
import {JobApplicationEntity} from "./jobApplication.entity.js";

export const resources = [];

const company = {
    resource: CompanyEntity,
    options: {},
};
resources.push(company);

export const industryResource = {
    resource: IndustryEntity,
    options: {
        properties: {
            text: {
                isTitle: true,
            },
        },
    },
};

resources.push(industryResource);

const matchResource = {
    resource: MatchEntity,
    options: {},
};

resources.push(matchResource);

const jobOpportunity: ResourceWithOptions = {
    resource: JobOpportunityEntity,

    options: {
        properties: {
            media: {
                isVisible: false,
            },
            location: {
                isVisible: false,
            },
            "payment.type": {
                //enum
                type: "string",
                availableValues: ["HOURLY", "FIXED", "MONTHLY"].map((v) => ({
                    value: v,
                    label: v,
                })),
            },
            "payment.amount": {
                type: "number",
            },
            "payment.currency": {
                availableValues: ["EUR"].map((v) => ({
                    value: v,
                    label: v,
                })),
                type: "string",
            },
            media_id: {
                isVisible: false,
            },
        },
    },
};

resources.push(jobOpportunity);

const j = {
    resource: JobProfileFrequencyEntity,
    options: {},
};

resources.push(j);

const jobProfiles = {
    resource: JobProfilesEntity,
    options: {},
};
resources.push(jobProfiles);


export const mediaEnt: ResourceWithOptions = {
    resource: MediaEntity,
    options: {},
};

resources.push(mediaEnt);

const ratings = {
    resource: RatingEntity,
    options: {},
};
resources.push(ratings);

const student = {
    resource: StudentEntity,
    options: {
        properties: {
            university_info: {
                type: "key-value",
            },
        }
    },

};

resources.push(student);

const location = {
    resource: LocationEntity,
    options: {},
};

resources.push(location);

const studentCV = {
    resource: StudentVideoCVEntity,

    options: injectManyToManySupport(
        {
            actions: {
                new: {},
                edit: {},
            },
            properties: {
                jobProfiles: {
                    isVisible: true,
                },
            },

            // sort: { sortBy: 'id', direction: 'asc' },
        },
        [{propertyName: "jobProfiles", modelClassName: "JobProfilesEntity"}],
    ),
};

resources.push(studentCV);

const userResource = {
    resource: UserEntity,
    options: {
        properties: {
            firebase_uid: {
                isVisible: true,
            }
        }
    },
};

resources.push(userResource);

const skillsResource = {
    resource: JobSkillsEntity,
    options: {},
};

resources.push(skillsResource);

const waitlistResource = {
    resource: WaitlistEntity,
    options: {},
};

resources.push(waitlistResource);

const jobApplication = {
    resource: JobApplicationEntity,
    options: {},
};

resources.push(jobApplication);


const empploymentRecordResource = {
    resource: EmploymentRecordEntity,
    options: {},
};
resources.push(empploymentRecordResource);

const sentNotificationResource = {
    resource: SentNotificationEntity,
    options: {
        properties: {
            notification: {
                type: "key-value",
            },
        },
    },
};

resources.push(sentNotificationResource);
