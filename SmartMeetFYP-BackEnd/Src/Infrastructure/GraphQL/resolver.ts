//@ts-ignore
import { userDbRepo } from "../Database/userRepo.ts/userDb.js";
//@ts-ignore
import { OrganizationMemberDbRepo } from "../Database/Member/OrganizationMember.js";
//@ts-ignore
import { OrganizationDbRepo } from "../Database/OrganizationRepo/organization.js";
//@ts-ignore
import { MeetingDbRepo } from "../Database/Meeting/meetingRepo.js";
//@ts-ignore
import { ApplicationError } from "../../BusinessLogic/ErrorHandling/appErrors.js";

const userFetcher:userDbRepo = new userDbRepo()
const organmMember:OrganizationMemberDbRepo = new OrganizationMemberDbRepo();
const organ:OrganizationDbRepo = new OrganizationDbRepo();
const meetings:MeetingDbRepo = new MeetingDbRepo(); 

export const resolvers = {
  Query: {
        getUserbyId: async (_:any, args:any , context:any) =>{
            return await userFetcher.getUserbyId(context.userId);
        },

        getOrganizationbyId:async (_:any, args:any , context:any)=>{
            const organization=  await organ.getOrganizationByHostOrMember(context.userId ,args.id)
            if(organization == null){
              throw new ApplicationError(400 , "Organization not found or access denied");
            }
            return organization;
        },
        getMeetingById:async (_:any , args:any , context:any)=>{
            return await meetings.getMeetingByid(args.id)
        }
        

  },

  Users: {
    member:async (obj:any)=>{
        return await organmMember.getOrganizationByMember(obj.id);
    },
    ownedOrganizations:async (obj:any)=>{
      return await organ.getOrganizationByHost(obj.id)
    }
  },
  OrganizationMember:{
    organization: async (obj:any)=>{
        return await organ.getOrganizationById(obj.organizationId);
    },
    user:async (obj:any) =>{
        return await userFetcher.getUserbyId(obj.userId);
    }
  },
  
  Meeting:{
    organization: async (obj:any) =>{
        return await organ.getOrganizationById(obj.organizationId);
    },
    host: async (obj:any) =>{
        return await userFetcher.getUserbyId(obj.hostId)
    },
    participants: async (obj:any) => {
    return await meetings.getParticipantsByMeetingId(obj.id)
  }
  }

};

