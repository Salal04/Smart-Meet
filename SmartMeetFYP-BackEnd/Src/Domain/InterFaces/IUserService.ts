import type { InternalUserDTO } from "../DTOs/userDTOs/InternalUser.js"; 

export interface IUserService{
       createUser(user:InternalUserDTO): Promise<InternalUserDTO>
       updateUser(id : number, user:InternalUserDTO): Promise<InternalUserDTO>
       deleteUser(id:number): Promise<InternalUserDTO>
       getUserbyId(id:number):Promise<InternalUserDTO | null>
       getUserbyEmail(email:string):Promise<InternalUserDTO | null>
}