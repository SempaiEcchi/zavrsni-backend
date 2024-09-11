import {caching} from "cache-manager";

export const memoryCache = await caching("memory", {
    max: 100,
    ttl: 1000 * 1000 /*milliseconds*/,
});
