import type { OrganizationDTOs } from "../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";
import type {IOrganizationService}  from "../../Domain/InterFaces/IOrganizationService.js";
export class MeetingValidator {
 
    private organDataStorage:IOrganizationService;

    constructor(od: IOrganizationService){
        this.organDataStorage = od;
    }

    isTimeValid(time: string | Date):boolean{
        const start =time instanceof Date ? time : new Date(time);
        return start.getTime() > Date.now()
    }

    isValidEndTime(start: string | Date, end: string | Date): boolean {
        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);

        return this.isTimeValid(startDate) && endDate.getTime() > startDate.getTime();
    }
    
    async isOrganizationExists(id: number):Promise<boolean>{
        const organ:OrganizationDTOs | null = await this.organDataStorage.getOrganizationById(id)
        if (organ == null){
            return false;
        }
        return true;

    }
}


