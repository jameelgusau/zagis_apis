import {  Response, NextFunction } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { UploadedFile } from 'express-fileupload';

const MB  = 4;
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

const fileSizeLimiter = (req: JWTRequest, res: Response, next: NextFunction) => {
    const files = req.files;
    const filesOverLimit: string[] = [];
    if (files !== null && files !== undefined) {
    Object.keys(files).forEach((key) => {
        const file: UploadedFile | UploadedFile[] = files[key];
        if (Array.isArray(file)) {
            // Handle array of files if needed
            file.map((fil)   =>{
                if(fil.size > FILE_SIZE_LIMIT){
                    filesOverLimit.push(fil.name)
                }
            })

        } else {
            if(file.size > FILE_SIZE_LIMIT){
                filesOverLimit.push(file.name)
            }
        }
      });
    if(filesOverLimit.length){
        const properVerb = filesOverLimit.length > 1 ? 'are':  'is';
        const sentence = `Uploaded ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`.replaceAll(',', ', ')
        const message = filesOverLimit.length < 3 ? sentence.replace(',', ' and'): sentence.replace(/,(?=[^,]*$)/, ' and')

        return res.status(413).json({
            meta: {status: 413, message},
            data: {}
        });
    }
}
    next();
}

export default fileSizeLimiter;