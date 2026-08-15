import type { IUserService } from "../../Domain/InterFaces/IUserService.js";
//@ts-ignore
import { organizationValidator } from "./orginzationChecks.js";
import type { OrganizationDTOs } from "../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";
import type { IOrganizationService } from "../../Domain/InterFaces/IOrganizationService.js";
import type { Member } from "../../Domain/DTOs/OrganizationMemberDTOs/MemberDTOs.js";
import type { IOrganizationMemberService } from "../../Domain/InterFaces/IOrganizatiobMemberService.js";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.js";
import type { IMeetingService } from "../../Domain/InterFaces/IMeetingService.js";
import type { MeetingDTOs } from "../../Domain/DTOs/MeetingDTOs/meetingDTOs.js";
import fs from 'fs/promises';
export class OrganizationService {

    private userdataStorage:IUserService; 
    private OrganDataStorage:IOrganizationService;
    private validation: organizationValidator;
    private memberStorage: IOrganizationMemberService;
    private meeting : IMeetingService;

    constructor(OD:IOrganizationService, ds:IUserService , ms:IOrganizationMemberService, meet:IMeetingService){
        this.userdataStorage= ds;
        this.memberStorage = ms;
        this.meeting = meet;
        this.OrganDataStorage = OD;
        this.validation = new organizationValidator(this.userdataStorage , this.OrganDataStorage)
    }

    async createOrganization(organ:OrganizationDTOs ):Promise<OrganizationDTOs> {
        console.log('[Create Organ is called ] : ----')
        if(organ.name.length < 2){
            throw new ApplicationError(400,"Bad Request")
        } 
        if(!await this.validation.isValidUser(organ.ownerId)){
            throw new ApplicationError(400,"Bad Request")
        }
        console.log('[All Cases Clear] : ----')
        organ.organizationCode=''
        organ.totalParticipants = 1;
        organ.createAt = new Date;
        let crOrgan:OrganizationDTOs =  await this.OrganDataStorage.createOrganization(organ);
        crOrgan.organizationCode =  String(crOrgan.id)+String(this.validation.getRandomFiveDigit());
        crOrgan = await this.updateOrganization(crOrgan)
        console.log('[Created!]:' , crOrgan)
        return crOrgan;
    }

    async updateOrganization(organ:OrganizationDTOs ):Promise<OrganizationDTOs> {
        const organExists =  await this.validation.isOrganizationExists(organ.id)
        const haveOnwerShip =  await this.validation.checkOwnership(organ.id, organ.ownerId)
        if (!organExists){
            throw new ApplicationError(404,"Not Found")
        }

        if (!haveOnwerShip){
            throw new ApplicationError(403,"Forbidden")
        }
        
        let organization:OrganizationDTOs =  await this.OrganDataStorage.updateOrganization(organ.id,organ);
        return organization;
    }

    async updateOrganizationCode(id:number , ownerId:number):Promise<string>{
        
        const organ:OrganizationDTOs | null = await this.OrganDataStorage.getOrganizationById(id);
        
        if (organ==  null){
            throw new ApplicationError(404,"Not Found")
        }
        if(ownerId != organ.ownerId){
            throw new ApplicationError(403,"Forbidden")
        }

        organ.organizationCode = String(organ.id) + String(this.validation.getRandomFiveDigit());
        await this.updateOrganization(organ);
        return organ.organizationCode;        
    }


    async deleteOrganization(id:number , deletedRequestBy:number ):Promise<OrganizationDTOs>{

        const organExists =  await this.validation.isOrganizationExists(id)
        const haveOnwerShip =  await this.validation.checkOwnership(id, deletedRequestBy)

        if (!organExists){
            throw new ApplicationError(404,"Not Found")
        }
        if (!haveOnwerShip){
            throw new ApplicationError(403,"Forbidden")
        }
        const obj =  await this.OrganDataStorage.deleteOrganization(id);
       obj.ImagePath && await fs.unlink(obj.ImagePath).catch(() => {});
        const memebers:Member[] =await this.memberStorage.getAllMemberByOrganiztion(id)
        const meetings:MeetingDTOs[] = await this.meeting.getMeetingbyOrganization(id)
        await Promise.all(meetings.map(mem =>this.meeting.deleteMeeting(mem.id)))
        await Promise.all(memebers.map(mem => this.memberStorage.deleteMember(mem.userId)));
        return obj;
    }

    
}