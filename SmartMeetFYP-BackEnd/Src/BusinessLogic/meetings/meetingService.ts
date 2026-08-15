import type { IOrganizationService } from "../../Domain/InterFaces/IOrganizationService.js";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.js";
import type { IMeetingService } from "../../Domain/InterFaces/IMeetingService.js";
import type { MeetingDTOs } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js";
import type { MeetingParticipantDto } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js";
 
//@ts-ignore
import { MeetingValidator } from "./meetingChecks.js";
export class MeetingService {

    private meetingDataStorage:IMeetingService;
    private validation: MeetingValidator;

    constructor(OD:IOrganizationService , MS: IMeetingService){
        this.meetingDataStorage = MS;
        this.validation = new MeetingValidator(OD)
    }

    async createMeeting(meeting:MeetingDTOs ):Promise<MeetingDTOs> {
        const startTime = meeting.startTime instanceof Date ? meeting.startTime : new Date(meeting.startTime);

        const validTime = this.validation.isTimeValid(startTime);
        const organization =await this.validation.isOrganizationExists(meeting.organizationId);

        if (!validTime ){
            throw new ApplicationError(400 , "Start Time is not Valid");
        }
        if (!organization){
            throw new ApplicationError(400 , "Organization Not Exists");
        }
        const meet:MeetingDTOs = await this.meetingDataStorage.createMeeting(meeting);
        return meet;
    }


    async createMeetingParticipant(meeting:MeetingParticipantDto ):Promise<MeetingParticipantDto> 
    { 
    const result:MeetingParticipantDto = await this.meetingDataStorage.createMeetingParticpant(meeting);
    return result;
    }

    async updateMeeting(meeting:MeetingDTOs ):Promise<MeetingDTOs> {
        const validTime = this.validation.isTimeValid(meeting.startTime);
        const organization =await this.validation.isOrganizationExists(meeting.organizationId);

        if (!validTime ){
            throw new ApplicationError(400 , "End Time is not valid");
        }
        if (!organization){
            throw new ApplicationError(400 , "organization Not Exists");
        }
        const meet:MeetingDTOs = await this.meetingDataStorage.updateMeeting(meeting.id,meeting);
        return meet;
    }

    async cancelMeeting(userId:number,meetingId:number):Promise<boolean>{
        
        const meetingDB:MeetingDTOs | null = await this.meetingDataStorage.getMeetingByid(meetingId);    
        if(meetingDB == null){
            throw new ApplicationError(404,"Meeting Not Found")
        }

        const organization =await this.validation.isOrganizationExists(meetingDB.organizationId);
        if (!organization){
            throw new ApplicationError(400 , "Organization is not Valid");
        }

        if(userId !=meetingDB.hostId){
            throw new ApplicationError(403 , "UnAutherized");
        }

        const del:number = await this.meetingDataStorage.deleteMeeting(meetingDB.id);
        return del != 0;
    }
    
}