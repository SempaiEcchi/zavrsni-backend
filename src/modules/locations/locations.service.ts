import {Injectable} from "@nestjs/common";
 // import {Client, PlaceInputType} from "@googlemaps/google-maps-services-js";
import {LatLng} from "../../common/ip2location.js";
import {ConfigService} from "@nestjs/config";
import logger from "../../logger.js";
import {Client, PlaceInputType} from "@googlemaps/google-maps-services-js";



@Injectable()
export class LocationsService {

    private  mapsClient: Client= new Client({});



    //configservice in constructor
    constructor(
        private readonly configService: ConfigService,
    ) {
    }


    async getCityName(latLng: LatLng) {
        const response = await this.mapsClient.reverseGeocode({
            params: {
                latlng: `${latLng.lat},${latLng.lng}`,
                key: this.configService.get("MAPS_API_KEY"),
            },
        });
        return response.data.results[0].address_components[2].long_name;
    }

    async getLocationFromCityName(cityName: string): Promise<LatLng | null> {
        try {
            const response = await this.mapsClient.findPlaceFromText({
                params: {
                    input: cityName,
                    inputtype: PlaceInputType.textQuery,
                    fields: ["geometry"],
                    key: this.configService.get("MAPS_API_KEY"),
                },
            });
            logger.info(response.data.candidates[0])
            const latLng = response.data.candidates[0].geometry.location;
            return new LatLng(latLng.lat, latLng.lng);
        } catch (e) {
            return null;
        }

    }

    getUniversityDepartments(): Record<string, string[]> {
        return {
            Pula: ["FIPU", "FET", "FPZ", "FOOZ", "FFPU", "MFPU", "MAPU", "TFPU"],
            Zagreb: ["TVZ", "FER", "PMF", "FFZG"],
            Split: ["FESB", "PMFST", "KTF"],
            Rijeka: ["RITEH", "EFRI", "MEDRI"],
            Osijek: ["FERIT", "GEOF", "TFOS"],
            Varazdin: ["FOI"],
            Dubrovnik: ["IMSA"],
            Pozega: ["TPU"],
            Ostalo: ["Ostalo"],
        };
    }
}



