import type { OrganizationDTOs } from '../DTOs/OrganizationDTOs/organizationDTO.js'
import type { Member } from '../DTOs/OrganizationMemberDTOs/MemberDTOs.js'

export interface IOrganizationMemberService{
       addMember(organ:Member): Promise<Member>
       deleteMember(id:number): Promise<number>
       getOrganizationByMember(id:number):Promise<Member[]>
       getMemberByUserAndOrganization(OrganId:number ,memberId:number ):Promise<Member | null>
       getAllMemberByOrganiztion(id:number):Promise<Member[]>
}