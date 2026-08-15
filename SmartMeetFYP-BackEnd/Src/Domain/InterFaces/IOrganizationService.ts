import type{ OrganizationDTOs } from "../DTOs/OrganizationDTOs/organizationDTO.js"

export interface IOrganizationService{
       createOrganization(organ:OrganizationDTOs): Promise<OrganizationDTOs>
       updateOrganization(id:number,  organ:OrganizationDTOs): Promise<OrganizationDTOs>
       deleteOrganization(id:number): Promise<OrganizationDTOs>
       getOrganizationById(id:number):Promise<OrganizationDTOs | null>
       getOrganizationByCode(code:string):Promise<OrganizationDTOs | null>
       getOrganizationByHost(id:number):Promise<OrganizationDTOs[]>
}