import express from "express"
import dotenv from "dotenv"
import { StreamClient } from "@stream-io/node-sdk"
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure/Database/OrganizationRepo/organization.js"
//@ts-ignore
import { ApplicationError } from "../../BusinessLogic/ErrorHandling/appErrors.js"
//@ts-ignore
import { verifyUser } from "../MiddleWares/jwtAuthMiddleware.js"
//@ts-ignore
import { MeetingService } from "../../BusinessLogic/meetings/meetingService.js"
//@ts-ignore
import { MeetingDbRepo } from "../../Infrastructure/Database/Meeting/meetingRepo.js"
import type { MeetingDTOs } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js"
import type { MeetingParticipantDto } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js"
//@ts-ignore
import { createMeeting, getMeeting, endMeeting } from "../MeetingSession/session.js"

import multer from "multer"
import ffmpeg from "fluent-ffmpeg"
import FormData from "form-data"
import fs from "fs"
import axios from "axios"
import path from "path"

import ffmpegStatic from "ffmpeg-static"

dotenv.config()
ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string)

const MeetingRoute = express.Router()

const meetingService: MeetingService = new MeetingService(
  new OrganizationDbRepo(),
  new MeetingDbRepo()
)

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or secret missing")
}

const serverClient = new StreamClient(apiKey, apiSecret)

const CV_MODULE_URL = "https://uncontingently-bonelike-alvaro.ngrok-free.dev" 
 



MeetingRoute.post("/CreateMeeting", verifyUser, async (req, res) => {
  try {
    const meeting = req.body
    console.log("Body received:", JSON.stringify(meeting, null, 2))

    const meetingCreated: MeetingDTOs = {
      id: meeting.id,
      name: meeting.name,
      description: meeting.description,
      organizationId: Number(meeting.organizationId),
      startTime: new Date(meeting.startTime),
      daily: meeting.daily === true || meeting.daily === "true",
      EnableEngagement: meeting.EnableEngagement === true || meeting.EnableEngagement === "true",
      weekly: meeting.weekly,
      hostId: Number(meeting.hostId),
      meetingDuration: Number(meeting.meetingDuration),
      meetingLink: meeting.meetingLink,
      Engagment: Number(meeting.Engagment)
    }

    console.log("MeetingCreated object:", JSON.stringify(meetingCreated, null, 2))
    const created = await meetingService.createMeeting(meetingCreated)
    return res.status(201).json(created)
  } catch (error) {
    console.error("FULL ERROR:", error) // ← this is missing in your file
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

MeetingRoute.put("/UpdateMeeting", verifyUser, async (req, res) => {
  try {
    const meeting: MeetingDTOs = req.body
    const updated = await meetingService.updateMeeting(meeting)
    return res.status(200).json(updated)
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

MeetingRoute.delete(
  "/DeleteMeeting/:meetingID",
  verifyUser,
  async (req: any, res) => {
    try {
      const meetingId = Number(req.params.meetingID)
      await meetingService.cancelMeeting(req.user.id, meetingId)
      return res.status(204).send()
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.status).json({ message: error.message })
      }
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
)

MeetingRoute.post("/JoinMeeting", verifyUser, async (req: any, res) => {
  try {
    const { data: user, meetingId } = req.body
    if (!user) {
      return res.status(400).json({ message: "User data missing" })
    }
    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID missing" })
    }

    const meetingIdNum = Number(meetingId)
    if (Number.isNaN(meetingIdNum)) {
      return res.status(400).json({ message: "Invalid meeting ID" })
    }

    await serverClient.upsertUsers([
      {
        id: String(user.id),
        role: user.role === "Host" ? "admin" : "user",
        name: user.name,
        image: user.ImagePath
      }
    ])

    const hostId = user.role === "Host" ? user.id : null
    if (!getMeeting(String(meetingIdNum))) {
      createMeeting(String(meetingIdNum), hostId)
    }

    const meeting = getMeeting(String(meetingIdNum))
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }

    // Preserve existing participant data on rejoin
    const existing = meeting.participants.get(Number(user.id))

    meeting.participants.set(Number(user.id), {
      userId: user.id,
      name: user.name,
      isActive: true,
      cameraOn: true,
      currentJoinTime: new Date(),
      firstJoinTime: existing?.firstJoinTime ?? new Date(),  // never overwrite original
      totalActiveSeconds: existing?.totalActiveSeconds ?? 0,
      engagementSum:      existing?.engagementSum      ?? 0,
      gazeSum:            existing?.gazeSum            ?? 0,
      postureSum:         existing?.postureSum          ?? 0,
      samples:            existing?.samples            ?? 0,
      deepSamples:        existing?.deepSamples         ?? 0,
    })

    console.log(`User ${user.id} joined meeting ${meetingIdNum}. Total participants: ${meeting.participants.size}`)
    console.log("Participants in meeting:", [...meeting.participants.keys()])

    const token = serverClient.createToken(String(user.id))
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        ImagePath: user.ImagePath,
        role: user.role
      }
    })
  } catch (error) {
    console.error("JoinMeeting error:", error)
    return res.status(500).json({ message: "Failed to join meeting" })
  }
})

MeetingRoute.post("/metrics", async (req: any, res) => {
  try {
    const { meetingId, userId, attention, posture, window } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(Number(userId))
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    if (!p.isActive || !p.cameraOn) {
      return res.send({ ignored: true })
    }
    p.totalActiveSeconds += window || 5
    p.gazeSum += attention || 0
    p.postureSum += posture || 0
    p.samples++
    
    
    console.log("participant metrics updated:",p)
    return res.send({ ok: true })
  } catch (error) {
    console.error("Metrics error:", error)
    return res.status(500).json({ message: "Failed to update metrics" })
  }
})


// Change this:
const upload = multer({ storage: multer.memoryStorage() })

// Route change:
MeetingRoute.post("/upload", upload.array("frames", 70), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files?.length || !req.body.user_id) {
      return res.status(400).json({ message: "Missing frames or user_id" })
    }

    const form = new FormData()
    form.append("user_id", req.body.user_id)
    form.append("meeting_id", req.body.meeting_id)

    files.forEach((file, i) => {
      form.append("frames", file.buffer, {
        filename: `frame_${String(i).padStart(4, "0")}.jpg`,
        contentType: "image/jpeg",
      })
    })

    const cvResponse = await axios.post(`${CV_MODULE_URL}/upload`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    })

    return res.status(200).json(cvResponse.data)

  } catch (error) {
    console.error("Upload error:", error)
    return res.status(500).json({ message: "Failed to upload video" })
  }
})

MeetingRoute.post("/camera-off", async (req, res) => {
  try {
    const { meetingId, userId } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(Number(userId))
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.cameraOn = false
    return res.send({ ok: true })
  } catch (error) {
    console.error("Camera-off error:", error)
    return res.status(500).json({ message: "Failed to update camera state" })
  }
})

MeetingRoute.post("/camera-on", async (req, res) => {
  try {
    const { meetingId, userId } = req.body
    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
    const p = meeting.participants.get(Number(userId))
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.cameraOn = true
    return res.send({ ok: true })
  } catch (error) {
    console.error("Camera-on error:", error)
    return res.status(500).json({ message: "Failed to update camera state" })
  }
})

MeetingRoute.post("/leave", async (req, res) => {
  try {
    const { meetingId, userId } = req.body

    if (!meetingId || userId === undefined) {
      return res.status(400).json({ message: "Missing required fields" })
    }
    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" })
    }
  
    const p = meeting.participants.get(Number(userId))
    if (!p) {
      return res.status(404).json({ message: "Participant not found" })
    }
    p.isActive = false

    console.log("Participant left the meeting")
    return res.send({ ok: true })
  } catch (error) {
    console.error("Leave error:", error)
    return res.status(500).json({ message: "Failed to leave meeting" })
  }
})

MeetingRoute.post("/end", verifyUser, async (req, res) => {
  try {
    console.log("End meeting request received")
    const { meetingId } = req.body
    if (!meetingId) {
      return res.status(400).json({ ok: false, message: "meetingId required" })
    }

    const meeting = getMeeting(meetingId)
    if (!meeting) {
      return res.status(404).json({ ok: false, message: "Meeting not found" })
    }

    console.log(`Ending meeting ${meetingId}. Total participants: ${meeting.participants.size}`)
    console.log("Participant IDs:", [...meeting.participants.keys()])

    const meetingEndTime = new Date()

    for (const participant of meeting.participants.values()) {
      const {
        userId,
        totalActiveSeconds,
        engagementSum,
        gazeSum,
        postureSum,
        samples,
        deepSamples,
        firstJoinTime,
        currentJoinTime,
      } = participant

      console.log(`Saving participant ${userId} — samples: ${samples}, activeSeconds: ${totalActiveSeconds}, deepSamples: ${deepSamples}`)

      const avgAttention = samples > 0     ? postureSum    / samples     : 0
      const avgGaze      = samples > 0     ? gazeSum       / samples     : 0
      const avgFace      = deepSamples > 0 ? engagementSum / deepSamples : 0

      const meetingSession: MeetingParticipantDto = {
        id:                 Number(meetingId),
        userId:             Number(userId),
        meetingId:          Number(meetingId),
        avgAttention,
        avgGaze,
        avgFace,
        totalActiveSeconds,
        firstJoinTime:      firstJoinTime ?? currentJoinTime,
        lastLeaveTime:      meetingEndTime,
      }

      try {
        await meetingService.createMeetingParticipant(meetingSession)
        console.log(`✓ Participant ${userId} saved successfully`)
      } catch (err) {
        console.error(`✗ Failed to save participant ${userId}:`, err)
      }
    }

    endMeeting(meetingId)
    return res.status(200).json({ ok: true, message: "Meeting ended and stats finalized" })
  } catch (error) {
    console.error("End meeting error:", error)
    if (error instanceof ApplicationError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({ message: "Failed to end meeting" })
  }
})

MeetingRoute.post("/ProcessResults", async (req, res) => {
  try {
    const { All_result } = req.body

    if (!All_result || !Array.isArray(All_result)) {
      return res.status(400).json({ message: "Missing or invalid All_result" })
    }

    for (const item of All_result) {
      const { user_id, meeting_id, result } = item

      console.log("Processing:", { user_id, meeting_id, result })


      const meeting = getMeeting(meeting_id)
      if (!meeting) continue // skip if meeting not found

      const participant = meeting.participants.get(Number(user_id))
      console.log("Found participant:", participant)
      if (!participant) continue // skip if participant not found
      var engagmentvalue = 0;

      if(result !== null ){
        if(result=="Engaged"){
          engagmentvalue = 66;
        }
        else if(result=="Highly-Engaged"){
          engagmentvalue = 99;
        }else if(result == "Not-Engaged"){
          engagmentvalue = 33;
        }
      }

      participant.engagementSum += engagmentvalue || 0
      participant.deepSamples++

      console.log("Participant updated with engagement:", participant)
    }

    return res.status(200).json({ message: "Results processed successfully" })

  } catch (error) {
    console.error("ProcessResults error:", error)
    return res.status(500).json({ message: "Failed to process results" })
  }
})

export default MeetingRoute
