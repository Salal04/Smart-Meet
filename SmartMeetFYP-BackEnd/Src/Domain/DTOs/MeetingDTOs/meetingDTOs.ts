export interface MeetingDTOs{
  id:number
  name:string
  description:string| null
  organizationId:number 
  startTime:Date
  daily: boolean 
  EnableEngagement:boolean
  weekly: boolean
  hostId:number
  meetingDuration:number
  meetingLink:string
  Engagment:number
}

export interface MeetingParticipantDto {
  id: number;

  meetingId: number;
  userId: number;

  totalActiveSeconds: number;
  avgAttention: number;
  avgGaze: number;
  avgFace: number;

    firstJoinTime: Date | null
    lastLeaveTime: Date | null
}



