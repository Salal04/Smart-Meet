import PostSQLClient from "../dbCon.js"
import type { IOrganizationMemberService } from "../../../Domain/InterFaces/IOrganizatiobMemberService.js";
import type { Member } from "../../../Domain/DTOs/OrganizationMemberDTOs/MemberDTOs.js";

export class OrganizationMemberDbRepo implements IOrganizationMemberService{
    private postSQlClient;

    constructor(){
        this.postSQlClient = PostSQLClient.getClient();
        // this.postSQlClient.$connect()
    }

    async addMember(user:Member): Promise<Member> {
        const users  = await this.postSQlClient.organizationMember.create({data:user})  
        return users;
    }

    async deleteMember(ids: number): Promise<number> {
        const users  = await this.postSQlClient.organizationMember.delete({where:{id : ids}}) ; 
        return users.id;
    }

    async getOrganizationByMember(ids: number): Promise<Member[]> {
        const mem:Member[] = await this.postSQlClient.organizationMember.findMany({where:{userId : ids}}) ; 
        return mem;
    }
    async getMemberByUserAndOrganization(OrganId:number ,memberId:number ):Promise<Member | null>{
        const mem:Member | null = await this.postSQlClient.organizationMember.findFirst({where:{userId : memberId , organizationId: OrganId}}) 
        return mem
    }
    

    async getAllMemberByOrganiztion(id:number):Promise<Member[]>{
        const mem:Member[] = await this.postSQlClient.organizationMember.findMany({where:{organizationId : id}}) ; 
        return mem;
    }
}