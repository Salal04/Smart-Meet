import type { MeetingDTOs } from "../DTOs/MeetingDTOs/meetingDTOs.js"
import type { MeetingParticipantDto } from "../DTOs/MeetingDTOs/meetingDTOs.js"

export interface IMeetingService{
       createMeeting(organ:MeetingDTOs): Promise<MeetingDTOs>
       createMeetingParticpant(organ:MeetingParticipantDto): Promise<MeetingParticipantDto>
       updateMeeting(id : number, organ:MeetingDTOs): Promise<MeetingDTOs>
       deleteMeeting(id:number): Promise<number>
       getMeetingbyOrganization(id:number):Promise<MeetingDTOs[]>
       getMeetingByid(id:number):Promise<MeetingDTOs | null>
       getMeetingbyTime(int:string , organId:number , limit:number):Promise<MeetingDTOs[]>
}

 