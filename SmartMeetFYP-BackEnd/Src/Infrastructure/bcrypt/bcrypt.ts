import type { IhashService } from "../../Domain/InterFaces/IHashService.js"; 
import bcrypt from "bcrypt";

export class hashPassword implements IhashService{
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; 
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }
    async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }
    
}