export interface OrganizationDTOs{
  id:number
  name:string 
  description:string
  ImagePath:string | null
  createAt:Date 
  organizationCode:string
  domainName:string | null
  totalParticipants: number
  domainRestrictionFlag: boolean 
  ownerId:number 
}