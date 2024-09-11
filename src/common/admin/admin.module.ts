import {Database, Resource} from "@adminjs/typeorm";
import AdminJS from "adminjs";
import {Module} from "@nestjs/common";
import {componentLoader} from "./components/components.js";
import {CustomResource} from "./admin.resource.js";
import {resources} from "../../models/resource.definitions.js";

//ResourceWithOptions
const x = import("@adminjs/nestjs");


export const options = {
    componentLoader,
    auth: process.env.NODE_ENV == "dev" ? null : {
        authenticate: async (email, password) => {
            if (password === "authpassword" && email === "firmusdeveloper@gmail.com")
                return {email: email};
        },

        cookiePassword: "makesurepasswordissecure",
        cookieName: "adminJsCookie",
    },
    adminJsOptions: {
        componentLoader: componentLoader,
        rootPath: "/admin",
        branding: {},
        resources: resources,
    },
};

@Module({
    imports: [
        x.then(function ({AdminModule}) {
            AdminJS.registerAdapter({Database, Resource: CustomResource});
            AdminJS.registerAdapter({Database, Resource});

            return AdminModule.createAdmin(options);
        }),
    ],
})
export class AdminModule {
}
