import {JobOpportunityEntity} from "../models/jobOpportunities.entity.js";

export function removeDuplicates(arr: JobOpportunityEntity[]) {
    const uniqueArray: JobOpportunityEntity[] = [];
    const comparator = (a: JobOpportunityEntity, b: JobOpportunityEntity) => {
        return a.id === b.id;
    };
    for (const item of arr) {
        if (!uniqueArray.some((uniqueItem) => comparator(item, uniqueItem))) {
            uniqueArray.push(item);
        }
    }
    return uniqueArray;
}
