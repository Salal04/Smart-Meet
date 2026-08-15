import express from "express";
//@ts-ignore
import { OrganizationService } from "../../BusinessLogic/organization/organService.js";
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure/Database/OrganizationRepo/organization.js";
//@ts-ignore
import { userDbRepo } from "../../Infrastructure/Database/userRepo.ts/userDb.js";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../../Infrastructure/Database/Member/OrganizationMember.js";
//@ts-ignore
import { ApplicationError } from "../../BusinessLogic/ErrorHandling/appErrors.js";
//@ts-ignore
import type { OrganizationDTOs } from "../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";
//@ts-ignore
import { upload } from '../MiddleWares/ImageMiddleware.js';
import fs from 'fs/promises';
//@ts-ignore
import { verifyUser} from "../MiddleWares/jwtAuthMiddleware.js";
//@ts-ignore
import { MeetingDbRepo } from "../../Infrastructure/Database/Meeting/meetingRepo.js";
import { BrevoEmail } from "../../Infrastructure/Email/email.js";


const organRoute = express.Router()
organRoute.use(express.json());
const OrganService: OrganizationService = new OrganizationService(new OrganizationDbRepo() , new userDbRepo() , new OrganizationMemberDbRepo(),new MeetingDbRepo);
const emailService: BrevoEmail = new BrevoEmail(`${process.env.SENDER_EMAIL}`)

organRoute.post('/CreateOrganization',verifyUser ,upload.single("image"),  async (req:any , res:any) =>{
    try{
        const organ:OrganizationDTOs =  req.body
        organ.ImagePath = req.file?.path?? null;
        organ.ownerId = req.user.id
        console.log("[Object Recivied]: " , organ)
        organ.domainRestrictionFlag = Boolean(organ.domainRestrictionFlag);
        const created:OrganizationDTOs = await OrganService.createOrganization(organ)
        return res.status(201).json({"Organization":created});
    }catch(error){

        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})


organRoute.put('/UpdateOrganization', verifyUser, upload.single("image") , async (req:any , res:any) =>{
    try{
        const organ:OrganizationDTOs =  req.body
        organ.ImagePath = req.file?.path?? null;
        organ.id = Number(organ.id);
        organ.ownerId= req.user.id;
        organ.domainRestrictionFlag = Boolean(organ.domainRestrictionFlag);
        const updated:OrganizationDTOs = await OrganService.updateOrganization(organ);
        return res.status(200).send(updated)

    }catch(error){
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
            
        }
        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

organRoute.get('/changeOrganizationCode/:id',verifyUser, async (req:any, res:any) =>{
    try{
        const code = await OrganService.updateOrganizationCode(Number(req.params.id) , req.user.id)
        return res.status(200).json({"organizationCode": code})

    }catch(error){
        if (error instanceof ApplicationError){
            console.error('[Error]: ' , error.message)
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})


organRoute.delete('/DeleteOrganization/:id',verifyUser ,upload.single("image"),  async (req:any, res:any ) =>{
    try{
        await OrganService.deleteOrganization(Number(req.params.id) , req.user.id)
        return res.status(204).send()
    }catch(error){

        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

organRoute.post('/SendEmail', verifyUser, async (req:any, res:any) =>{
    try{
        const {receivers , content , time} = req.body
        console.log("Requesting came here is : ", req.body)
        const result = await emailService.sendEmail(receivers, content, time);
        if (result) {
            return res.status(200).json({ message: "Emails sent successfully" });
        } else {
            return res.status(500).json({ message: "Failed to send emails" });
        }
    }catch(error){
        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]: ' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})




export default organRoute;