import type { IhashService } from "../../Domain/InterFaces/IHashService.js";
import type { InternalUserDTO } from "../../Domain/DTOs/userDTOs/InternalUser.js";
import type { IUserService } from "../../Domain/InterFaces/IUserService.js";
import type { promises } from "dns";
import type { IOrganizationMemberService } from "../../Domain/InterFaces/IOrganizatiobMemberService.js";
import type { IOrganizationService } from "../../Domain/InterFaces/IOrganizationService.js";
import type { OrganizationDTOs } from "../../Domain/DTOs/OrganizationDTOs/organizationDTO.js";
export class organizationValidator {
 
    private dataStorage:IUserService;
    private organDataStorage:IOrganizationService;

    constructor(ds:IUserService, od: IOrganizationService){

            this.dataStorage= ds;
            this.organDataStorage = od;
    }

    async isValidUser(id:number):Promise<boolean>{
        const user = await this.dataStorage.getUserbyId(id);
        if (user=== null){
            return false;
        }
        return true;
    }

    getRandomFiveDigit(): number {
        return Math.floor(Math.random() * 900000) + 100000;
    }
    
    async isOrganizationExists(id:number):Promise<boolean>{
          const organ:OrganizationDTOs | null  = await this.organDataStorage.getOrganizationById(id);
          if(organ == null){
            return false;
          }
          return true;
    }

    async checkOwnership(id:number , ownerId:number):Promise<boolean>{
          const organ:OrganizationDTOs | null  = await this.organDataStorage.getOrganizationById(id);
          if(organ != null){
            if (organ.ownerId == ownerId){
                return true;
            }
            return false;
          }
          return false;
    }
}


