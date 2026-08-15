import type { IOrganizationService } from "../../Domain/InterFaces/IOrganizationService.js";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.js";
import type { IOrganizationMemberService } from "../../Domain/InterFaces/IOrganizatiobMemberService.js";
import type { IUserService } from "../../Domain/InterFaces/IUserService.js";
//@ts-ignore
import { MemberValidator } from "./MemberChecks.js";
import type { Member } from "../../Domain/DTOs/OrganizationMemberDTOs/MemberDTOs.js";
import type { InternalUserDTO } from "../../Domain/DTOs/userDTOs/InternalUser.js";
import type { OrganizationDTOs } from "../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";

export class MemberService {

    private MemberDataStorage:IOrganizationMemberService;
    private validation: MemberValidator;
    private UserService: IUserService
    private OrganizationDataStorage: IOrganizationService;

    constructor(OD:IOrganizationService , MS: IOrganizationMemberService , us:IUserService){
        this.MemberDataStorage = MS;
        this.UserService= us
        this.OrganizationDataStorage = OD;
        this.validation = new MemberValidator(us , OD ,MS)
    }

    async joinOrganization(id:number, code:string ):Promise<Member> {

        if(code.length <=4 ){
            throw new ApplicationError(400 , 'Invalid Code')
        }
        
        //Checking user exists or not 
        const memberDetail:InternalUserDTO | null = await this.UserService.getUserbyId(id);
        if (memberDetail == null){
            throw new ApplicationError(400 , 'User not Exists')
        }
        
        //checking organization Exists or not
        const organization: OrganizationDTOs | null = await this.OrganizationDataStorage.getOrganizationByCode(code);
        if (organization == null){
            throw new ApplicationError(400 , 'Organization not Exists')
        }

        //checking whether member already joint or not 
        const memberFound:Member| null= await this.MemberDataStorage.getMemberByUserAndOrganization(organization.id,id)
        if(memberFound != null){
            throw new ApplicationError(400 , 'Already Member')
        }

        //checking user domain name matches or not
        if(organization.domainRestrictionFlag){
            if (!(organization.domainName!= null &&memberDetail.email.endsWith(`@${organization.domainName}`))){
                throw new ApplicationError(403 , 'Organization Not Allowed To Join')
            }
        }

        //checking user entered code match or not 
        if(code!==organization.organizationCode){
            throw new ApplicationError(403 , 'Code is wrong')
        }

        organization.totalParticipants +=1;
        const update = await this.OrganizationDataStorage.updateOrganization(organization.id,organization);
        console.log(update)
        const mem: Member = {
            organizationId: organization.id,
            userId: id,
            joinedAt: new Date()
        }
        
        const createdMem:Member = await this.MemberDataStorage.addMember(mem)
        return createdMem;

    }

    async removeFromOrganization(organizationId:number, requestedByUserId:number ):Promise<boolean> {
        
        
        //checking organization Exists or not
        const organization: OrganizationDTOs | null = await this.OrganizationDataStorage.getOrganizationById(organizationId);
        if (organization == null){
            throw new ApplicationError(400 , 'Organization not Exists')
        }
        //checking whether user is member or not 
        const memberFound:Member| null= await this.MemberDataStorage.getMemberByUserAndOrganization(organizationId ,requestedByUserId)
        if(memberFound == null){
            throw new ApplicationError(400 , 'Not Found')
        }
        if(memberFound.userId != requestedByUserId && organization.ownerId != requestedByUserId  ){
            throw new ApplicationError(403 , 'UnAutherized')
        }
        let affect  = 0
        if (memberFound.id != null){
            affect = await this.MemberDataStorage.deleteMember(memberFound.id)
        }
        return affect > 0;

    }
    
    
}