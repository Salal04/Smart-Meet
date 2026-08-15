//@ts-ignore
import { generateToken, verifyToken } from '../../Infrastructure/Authentication/jwt.js';

export function verifyUser(req: any, res: any, next: any) {
    console.log('Hell o g --- > ' )
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send("Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1]; 

    if (!token) {
        return res.status(401).send("Unauthorized: Token missing");
    }

    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).send("Unauthorized: Invalid token");
    }

    req.user = payload; 
    console.log('moving to next --- ')
    next();
}

export default verifyUser;
