import type { InternalUserDTO } from "../../../Domain/DTOs/userDTOs/InternalUser.js";
import  type {IUserService} from "../../../Domain/InterFaces/IUserService.js";
//@ts-ignore
import PostSQLClient from "../dbCon.js"

export class userDbRepo implements IUserService{
    private postSQlClient;
    constructor(){
        this.postSQlClient = PostSQLClient.getClient();
        // this.postSQlClient.$connect()
    }
    async createUser(user:InternalUserDTO): Promise<InternalUserDTO> {
        console.log('inside User ---- > ' , user)

           const userInterl = {
                name: user.name,
                email: user.email,
                password: user.password,
                ImagePath: user.ImagePath ?? null,         
                active: false,
                code: user.code ?? null,                    
                accountType: user.accountType ?? null,
                role: user.role ?? null,
                codeActivationTime: user.codeActivationTime ?? null,
                codeVerified: user.codeVerified ?? false
                
            };
        
        const users  = await this.postSQlClient.users.create({data:userInterl})  
        return users;
    }
    async updateUser(ids : number ,user: InternalUserDTO): Promise<InternalUserDTO> {

        const userInterl = {
                name: user.name,
                email: user.email,
                password: user.password,
                ImagePath: user.ImagePath ?? null,         
                active: user.active,
                code: user.code ?? null,                    
                accountType: user.accountType ?? null,
                role: user.role ?? null,
                codeActivationTime: user.codeActivationTime ?? null,
                codeVerified: user.codeVerified ?? false
        };
        

        const users  = await this.postSQlClient.users.update({where:{id : ids} , data:userInterl})  
        return users;
    }
    async deleteUser(ids: number): Promise<InternalUserDTO> {
        const users  = await this.postSQlClient.users.delete({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyId(ids: number): Promise<InternalUserDTO| null> {
        const users:InternalUserDTO |null  = await this.postSQlClient.users.findUnique({where:{id : ids}}) ; 
        return users;
    }
    async getUserbyEmail(emails: string): Promise<InternalUserDTO | null> {
        const users:InternalUserDTO |null   = await this.postSQlClient.users.findUnique({where:{email : emails}}) ; 
        return users;
    }
}