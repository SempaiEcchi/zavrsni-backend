import {Injectable} from "@nestjs/common";
import {JobOpportunityEntity} from "../models/jobOpportunities.entity.js";

@Injectable()
export class JobRecommendationsService {
    async getRecommendations(
        selectedProfiles: any,
    ): Promise<JobOpportunityEntity[]> {
        return [];
    }
}
