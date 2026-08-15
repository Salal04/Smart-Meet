import express from "express";
//@ts-ignore
import { OrganizationDbRepo } from "../../Infrastructure/Database/OrganizationRepo/organization.js";
//@ts-ignore
import { ApplicationError } from "../../BusinessLogic/ErrorHandling/appErrors.js";
//@ts-ignore
import { verifyUser} from "../MiddleWares/jwtAuthMiddleware.js";
//@ts-ignore
import { MemberService } from "../../BusinessLogic/Member/memberService.js";
//@ts-ignore
import { userDbRepo } from "../../Infrastructure/Database/userRepo.ts/userDb.js";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../../Infrastructure/Database/Member/OrganizationMember.js";


const MemberRoute = express.Router()
MemberRoute.use(express.json());
MemberRoute.use(express.urlencoded({ extended: true }));
const memberService:MemberService = new MemberService( new OrganizationDbRepo, new OrganizationMemberDbRepo, new userDbRepo);

MemberRoute.post('/JoinOrganization',verifyUser , async (req:any , res:any ) =>{
    try{
        const code =  req.body.code
        console.log('[Body]: ' ,  code)
        const created = await memberService.joinOrganization(req.user.id , code)
        return res.status(201).json({'message':'added!'})
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

MemberRoute.delete('/leaveOrganization/:organId',verifyUser , async (req:any , res:any ) =>{
    try{
        const orId =  req.params.organId;
        const result  = await memberService.removeFromOrganization(Number(orId)  , req.user.id)
        return res.status(204).send()
    }catch(error){

        if (error instanceof ApplicationError){
            return res.status(error.status).send({"message":error.message}) 
        }
        else{
            //@ts-ignore
            console.error('[Error]' , error.message)
            return res.status(500).send({"message":"Internal Server Error"})
        }
    }
})

export default MemberRoute;