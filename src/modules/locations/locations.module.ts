import {LocationsController} from "./locations.controller.js";
import {LocationsService} from "./locations.service.js";
import {DynamicModule, Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    controllers: [LocationsController],
    providers: [LocationsService],
})
export class LocationsModule {


}
