import type { promises } from "dns";
import type { InternalUserDTO } from "../../Domain/DTOs/userDTOs/InternalUser.js";
import type { IhashService } from "../../Domain/InterFaces/IHashService.js";
import type { IUserService } from "../../Domain/InterFaces/IUserService.js";
//@ts-ignore
import { userValidator } from "./userChecks.js";
import type { UserResponseDTO } from "../../Domain/DTOs/userDTOs/UserResponse.js";
import type { LoginUserDTO } from "../../Domain/DTOs/userDTOs/UserLogin.js";
//@ts-ignore
import { ApplicationError } from "../ErrorHandling/appErrors.js";
import type { IEmailService } from "../../Domain/InterFaces/IEmailService.js";
export class UserService {

    private hasher:IhashService;
    private dataStorage:IUserService; 
    private validation :userValidator;
    private sendingEmails: IEmailService;

    constructor(hasher:IhashService , ds:IUserService , emailService: IEmailService ){
        this.hasher = hasher;
        this.dataStorage= ds;
        this.validation = new userValidator(this.dataStorage)
        this.sendingEmails = emailService;
    }

    async createUser(user: InternalUserDTO):Promise<InternalUserDTO> {

        if(user.name == null || user.name.length < 3){
            throw new ApplicationError(400,"Bad Request")
        }
        if (!this.validation.isEmailCorrect(user.email)){
            throw new ApplicationError(400,"Bad Request");
        }
       if(!await this.validation.isEmailUnique(user.email)){
    throw new ApplicationError(409, "Account already exists"); // was 400 "Bad Request"
}
        if(!user.password || user.password.trim().length < 6){
            throw new ApplicationError(400,"Password must be at least 6 characters")
        }
        user.code = String(this.validation.getRandomFiveDigit())
        user.codeActivationTime =new Date();
        user.code && await this.sendingEmails.sendCode(user.email , user.code)
        user.password = user.password.trim();
        user.email= user.email.trim().toLocaleLowerCase();
        user.password = await this.hasher.hashPassword(user.password)
        return await this.dataStorage.createUser(user);
    }


    async LoginUser(userCredintials:LoginUserDTO):Promise<UserResponseDTO> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(userCredintials.email.trim().toLocaleLowerCase())
        
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        const res: boolean = await this.hasher.comparePassword(userCredintials.password.trim(), user.password)
        if (res == false){
            throw new ApplicationError(403,"Forbidden")
        }
        if(user.active ==false){
            throw new ApplicationError(404,"inactive")
        }

        const final: UserResponseDTO = {
            id: user.id,
            name: user.name,
            email: user.email,
            ImagePath: user.ImagePath ?? " "
        };
        return final;    
    } 

    async ActivateAccount(id:number,code:string):Promise<UserResponseDTO> {
        
        const user:InternalUserDTO | null = await this.dataStorage.getUserbyId(id)
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        console.log(code ,'==', user?.code)

        if (user?.code && code !== user.code){
            throw new ApplicationError(400,"Wrong Code ")
        }
        if (user.codeActivationTime && Date.now() >= new Date(user.codeActivationTime).getTime() + 10 * 60 * 1000){
            throw new ApplicationError(400, "Code TimeOut");
        }

        user.active= true;
        const activeUser:InternalUserDTO =  await this.dataStorage.updateUser(user.id , user);
        const final: UserResponseDTO = {
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            ImagePath: activeUser.ImagePath ?? " ",
            active:activeUser.active,
        };
        return final;       
    } 

    async forgetPassword(email:string):Promise<boolean> {

        const user:InternalUserDTO | null = await this.dataStorage.getUserbyEmail(email)
        if(user == null){
            throw new ApplicationError(404,"Not Found")
        }
        const cooldown = 0 * 60 * 1000
        const now = Date.now()
        if(user.codeActivationTime && (new Date(user.codeActivationTime).getTime() + cooldown) > now){
            const waitMs = (new Date(user.codeActivationTime).getTime() + cooldown) - now
            const waitMin = Math.ceil(waitMs / 1000 / 60)
            throw new ApplicationError(400, `Wait ${waitMin} minutes before requesting new code`)
        }
        user.code = String(this.validation.getRandomFiveDigit())
        user.codeActivationTime =new Date();
        await this.sendingEmails.sendCode(user.email, user.code);
        await this.dataStorage.updateUser(user.id , user);
        return true;
    }


    async verfiycode(email:string,code:string):Promise<InternalUserDTO> {

        const user = await this.dataStorage.getUserbyEmail(email);
        if(!user) throw new ApplicationError(404,"Not Found");

        if (user.codeActivationTime && new Date(user.codeActivationTime).getTime() + 10*60*1000 < Date.now()){
            throw new ApplicationError(400,"Activation Code is Expired! Try Again");
        }

        if(user.code !== code){
            throw new ApplicationError(400,"Wrong Code");
        }

        user.codeVerified = true;
        const updated:InternalUserDTO =  await this.dataStorage.updateUser(user.id, user);
        console.log('[Updated User!]:  ' ,updated  )

        return updated;
    }


    async resetPassword(email:string,newPassword:string):Promise<InternalUserDTO> {

        const user = await this.dataStorage.getUserbyEmail(email);
        if(!user) throw new ApplicationError(404,"Not Found");

        if(!user.codeVerified){
            throw new ApplicationError(400,"Please verify your OTP/Code first");
        }

        if(!newPassword || newPassword.trim().length < 6){
            throw new ApplicationError(400,"Password must be at least 6 characters");
        }

        user.password = await this.hasher.hashPassword(newPassword.trim());
        user.code = null;
        user.codeActivationTime = null;
        user.codeVerified = false;

        await this.dataStorage.updateUser(user.id,user);
        return user;
    }

}