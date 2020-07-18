import { Request, Response, NextFunction } from "express";
import { prepareError } from "../utils/utils";
import { verify } from "jsonwebtoken";


const isAuth = (req:Request,resp:Response,next:NextFunction) => {
    const authHeader = req.get('Authorization')
    if(!authHeader){
        throw prepareError('Not authenticated',401)
    }
    const token = authHeader.split(' ')[1];
    let tokenDecoded; 
    try {
        tokenDecoded = verify(token, 'mySuperSecret');
    } catch (error) {
        throw prepareError(error.message,500)
    }
    if(!tokenDecoded){
        throw prepareError('Not authenticated',401)
    }
    (req as any).userId = (tokenDecoded as any).userId

    next();
    
}

export default isAuth;