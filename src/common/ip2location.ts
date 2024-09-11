import * as ip2location from "ip-fetch";
import logger from "../logger.js";

export class LatLng {
    lat: number;
    lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }
}

const cache = new Map<string, LatLng>();

export async function locationFromIp(ip: string): Promise<LatLng | null> {
    if (cache.has(ip)) {
        return cache.get(ip);
    }
    try {
        const location: any = await ip2location.getLocationNpm(ip);
        const ll = new LatLng(
            location.lat,
            location.lon,
        );

        cache.set(ip, ll);
        return location;
    } catch (e) {
        logger.info("Error in ip2location.ts", e);
        return null;
    }

    return null;
}
