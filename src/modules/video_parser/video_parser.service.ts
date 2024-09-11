import {Injectable} from "@nestjs/common";
import OpenAI from "openai";
import logger from "../../logger.js";

@Injectable()
export class VideoParserService {
    private readonly openAi: OpenAI;

    constructor() {
        this.openAi = new OpenAI({
            apiKey: "",
        });
    }

    async image() {
        const img = await this.openAi.images.generate({
            prompt:
                "Design a logo that captures the essence of Ryan Gosling for a Linux-based operating system",
            model: "dall-e-3",
            n: 1,
            response_format: "url",
            style: "vivid",
        });
        logger.info(img);
        return img;
    }

    async getTextFromAudio(file: File) {
        const text = await this.openAi.audio.transcriptions
            .create({
                file: file,
                model: "whisper-1",
                language: "hr",
                response_format: "verbose_json",
                temperature: 0.000005,
            })
            .then((res) => res.text);
        return text;
    }

    async processAudioToJob(file: File) {
        const text = await this.getTextFromAudio(file);

        logger.info("text output", text);
        return text;
        let jobOutput = new ProcessedJobAudioDTO();

        // const convertedToJobDTO = await this.openAi.chat.completions.create({
        //   model: "gpt-3.5-turbo",
        //   temperature: 0.5,
        //   messages: [
        //     {
        //       role: "system",
        //       content: `You have received a text for which you need to output a json to be serialized into a DTO class
        //        with the following fields:${jobOutput.toStringWithTypes()}.
        //        Additional explainations are annotated with //, dont output them in json.
        //        You MUST output in json format
        //         which can be serialized back to the DTO class. You must fill fields that aren't optional(undefined).
        //         If you cannot place something into an existing field, add it to the description.
        //
        //         `,
        //     },
        //     {
        //       role: "user",
        //       content: text,
        //     },
        //   ],
        // });
        //
        // // jobOutput = JSON.parse(convertedToJobDTO.choices[0].message.content);
        // // logger.info("jobOutput", jobOutput);
        // logger.info(convertedToJobDTO);
        // return convertedToJobDTO.choices[0].message.content;
    }

    private async convertToJobDTO(text: string) {
    }
}

export class ProcessedJobAudioDTO {
    jobTitle: string;
    jobDescription: string;
    location: string;
    hourlyRate: number;
    applyDeadline: Date | undefined;
    workStartDate: Date | undefined;
    jobProfileName: string;
    jobType:
        | "FULL_TIME"
        | "PART_TIME"
        | "INTERNSHIP"
        | "PROJECT"
        | "VOLUNTEERING"
        | "OTHER";
    employeesNeeded: number;
    accommodationProvided: boolean;
    foodProvided: boolean;
    transportProvided: boolean;
    isSummerJob: boolean;
    shiftData: any;

    toStringWithTypes(): string {
        return `{
      jobTitle: string,
      
      //try to fill this with as much text as possible, you are allowed to use the text from the audio or guess
      jobDescription: string,
      location: string,
      
      //if user says a monthly salary instead of hourly rate, convert it to hourly rate
      hourlyRate: number,
      applyDeadline: Date|"",
      workStartDate: Date|"",
      //name of position for this job
      jobProfileName: string,
      jobType: string (FULL_TIME, PART_TIME, INTERNSHIP, PROJECT, VOLUNTEERING, OTHER)
      //if not mentioned its 1 by default
      employeesNeeded: number,
      accommodationProvided: boolean,
      foodProvided: boolean,
      transportProvided: boolean,
      // if its related to a job that can be done during the summer, its true
      isSummerJob: boolean,
      //can be just a string
      shiftData: any,
    }`;
    }
}
