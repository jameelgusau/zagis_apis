import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import fs from 'fs';
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { fileService, getFilesServices, updateFileService, deleteFileService } from "../services/file.service";



export const FileSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        cofo_number: Joi.string().required(),
        title_holder_name: Joi.string().required(),
        page_number: Joi.number().empty("").allow(null).optional(),
        landuse_id: Joi.string().guid().required(),
        purpose_id: Joi.string().guid().required(),
        serial_number: Joi.number().empty("").allow(null).optional(),
        volume_number: Joi.number().empty("").allow(null).optional(),
        registration_date: Joi.date().empty("").allow(null).optional(),
        execution_date: Joi.date().empty("").allow(null).optional(),
        collection_date: Joi.date().empty("").allow(null).optional(),
        certificate_type: Joi.string()
            .valid("Certificate", "Letter of Grant", "Temporary")
            .allow(null)
            .optional(),
        collected: Joi.string()
            .valid("Yes", "No")
            .allow(null)
            .optional(),
    });
    validateRequest(req, next, schema)
}


export const File = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const data = {
            ...body,
            created_by: req.auth?.id,
        }
        const account = await fileService(data);
        res.json({
            meta: {
                status: 200,
                message: "File added successful"
            },
            data: account
        });
    } catch (error) {
        next(error);
    }
}

export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await getFilesServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: files
        })

    } catch (error) {
        next(error)
    }
}

export const updateFileSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        file_id: Joi.string().guid().required(),
        cofo_number: Joi.string().required(),
        title_holder_name: Joi.string().required(),
        landuse_id: Joi.string().guid().required(),
        purpose_id: Joi.string().guid().required(),
        page_number: Joi.number().empty("").allow(null).optional(),
        serial_number: Joi.number().empty("").allow(null).optional(),
        volume_number: Joi.number().empty("").allow(null).optional(),
        registration_date: Joi.date().empty("").allow(null).optional(),
        execution_date: Joi.date().empty("").allow(null).optional(),
        collection_date: Joi.date().empty("").allow(null).optional(),
        certificate_type: Joi.string()
            .valid("Certificate", "Letter of Grant", "Temporary")
            .allow(null)
            .optional(),
        collected: Joi.string()
            .valid("Yes", "No")
            .allow(null)
            .optional(),
    });
    validateRequest(req, next, schema)
}


export const updateFile = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const data = {
            ...body,
            updated_by: req.auth?.id,
        }
        const account = await updateFileService(data);
        res.json({
            meta: {
                status: 200,
                message: "File added successful"
            },
            data: account
        });
    } catch (error) {
        next(error);
    }
}

export const deleteFile = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        await deleteFileService(req.params?.id as string)
        res.json({
            meta: {
                status: 200,
                message: "File deleted successfully"
            },
            data: {

            }
        })
    } catch (error) {
        next(error)
    }
}

