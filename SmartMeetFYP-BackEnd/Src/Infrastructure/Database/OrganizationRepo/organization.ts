//@ts-ignore
import PostSQLClient from "../dbCon.js"
import type { IOrganizationService } from "../../../Domain/InterFaces/IOrganizationService.js";
import type { OrganizationDTOs } from "../../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";

export class OrganizationDbRepo implements IOrganizationService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClient.getClient();
        // this.postSQlClient.$connect()
    }
    async createOrganization(user: OrganizationDTOs): Promise<OrganizationDTOs> {
        const org = {
            name: user.name,
            description: user.description,
            createAt: user.createAt,
            organizationCode: user.organizationCode,
            domainName: user.domainName,
            totalParticipants: user.totalParticipants,
            domainRestrictionFlag: user.domainRestrictionFlag,
            ownerId: user.ownerId
        }
        const users  = await this.postSQlClient.organization.create({data:org})  
        return users;
    }
    async updateOrganization(ids : number ,organ: OrganizationDTOs): Promise<OrganizationDTOs> {
        const org = {
            name: organ.name,
            description: organ.description,
            createAt: organ.createAt,
            organizationCode: organ.organizationCode,
            domainName:organ.domainName,
            totalParticipants:organ.totalParticipants,
            domainRestrictionFlag: organ.domainRestrictionFlag,
            ownerId: organ.ownerId
        }
        const users  = await this.postSQlClient.organization.update({where:{id : ids} , data:org})  
        return users;
    }
    async getOrganizationById(id:number):Promise<OrganizationDTOs | null>{
        const user:OrganizationDTOs | null  = await this.postSQlClient.organization.findUnique({where:{id : id}})
        return user;
    }
    async getOrganizationByCode(code:string):Promise<OrganizationDTOs | null>{
        const user:OrganizationDTOs | null  = await this.postSQlClient.organization.findUnique({where:{organizationCode  : code}})
        return user;
    }
    async deleteOrganization(ids: number): Promise<OrganizationDTOs> {
        const users  = await this.postSQlClient.organization.delete({where:{id : ids}}) ; 
        return users;
    }
    async getOrganizationByHost(ids: number): Promise<OrganizationDTOs[]> {
        const users:OrganizationDTOs[] = await this.postSQlClient.organization.findMany({where:{ownerId : ids}}) ; 
        return users;
    }

async getOrganizationByHostOrMember(userId: number, orgId: number): Promise<OrganizationDTOs | null> {
  const org = await this.postSQlClient.organization.findFirst({
    where: {
      id: orgId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: {
      owner: true,
      members: {
        include: {
          user: true
        }
      },
      meeting: true
    }
  });
  return org;
}
}