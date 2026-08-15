
export type ParticipantStats = {
  userId: number
  name: string
  isActive: boolean
  cameraOn: boolean
  currentJoinTime: Date | null
  firstJoinTime: Date | null        // ← add this
  totalActiveSeconds: number
  engagementSum: number
  gazeSum: number
  postureSum: number
  samples: number
  deepSamples: number
}

export type MeetingSession = {
  meetingId: string
  hostId: number
  startTime: Date
  endTime?: Date
  participants: Map<number, ParticipantStats>
}

const meetings = new Map<string, MeetingSession>()

export function createMeeting(meetingId: string, hostId: number) {
  meetings.set(meetingId, {
    meetingId,
    hostId,
    startTime: new Date(),
    participants: new Map()
  })
}

export function getMeeting(meetingId: string) {
  return meetings.get(meetingId)
}

export function endMeeting(meetingId: string) {
  meetings.delete(meetingId)
}
