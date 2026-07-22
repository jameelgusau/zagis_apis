import {  Response, NextFunction } from 'express';
import { Request as JWTRequest } from "express-jwt";

const filesPayloadExists = (req: JWTRequest , res: Response, next: NextFunction) => {
    // console.log(req)
    if(!req.files) throw 'Upload image(s)';
    next();
}

export default filesPayloadExists;