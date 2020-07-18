import { NextFunction } from "express";


export const handleErrors = (next: NextFunction, error: any) => {
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
}

export const prepareError = (message: string, statusCode: number, data?:any): Error => {
    const error = new Error(message);
    (error as any).statusCode = statusCode
    if(data){
      (error as any).data = data;  
    }
    return error
}
