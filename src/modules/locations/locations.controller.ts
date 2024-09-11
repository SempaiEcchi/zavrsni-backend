import {Controller, Get, Param,} from "@nestjs/common";
import {LocationsService} from "./locations.service.js";

@Controller("location")
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {
    }


    @Get("/university")
    getUniversityDepartments(): Record<string, string[]> {
        return this.locationsService.getUniversityDepartments();
    }

    @Get("/city/:name")
    getLatLngFromCityName(@Param("name") cityName: string) {
        return this.locationsService.getLocationFromCityName(cityName);
    }


}
