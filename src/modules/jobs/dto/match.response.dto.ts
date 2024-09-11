import {JobOpportunityEntity} from "../../../models/jobOpportunities.entity.js";

export class MatchResponseDto {
    match_id: string;
    chat_id: string;
    job_opportunity: Partial<JobOpportunityEntity>;
}
