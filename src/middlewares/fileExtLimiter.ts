import { Response, NextFunction } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { UploadedFile } from 'express-fileupload';
import path from 'path'

const fileExtLimiter = (allowedExtArray: string[]): any => {
   return (req: JWTRequest, res: Response, next: NextFunction): any => {
      const files = req.files;
      const fileExtensions: string[] = [];
      if (files !== null && files !== undefined) {
         Object.keys(files).forEach((key) => {
            const file: UploadedFile | UploadedFile[] = files[key];
            if (Array.isArray(file)) {
               file.map(fil => {
                  fileExtensions.push(path.extname(fil.name))
               })
            } else {
               fileExtensions.push(path.extname(file.name))
            }
         })
         const allowed = fileExtensions.every(ext => allowedExtArray.includes(ext.toString().toLowerCase()))

         if (!allowed) {
            const message = `Uploaded failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(',', ', ');
            return res.status(422).json({
               meta: { status: 422, message },
               data: {}
            })
         }
      }


      next();
   }
}

export default fileExtLimiter;