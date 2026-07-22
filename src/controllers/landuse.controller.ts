import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { addLanduseServices, getLanduseServices, addPurposeServices, gePurposesServices, updatePurposeService, deletePurposeService, getLanduseAndPurposeServices } from "../services/landuse.service"; 


export const addLanduseSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        landuse_name: Joi.string().required(),
    });
    validateRequest(req, next, schema)
}

export const addLanduse = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const data = {
            ...body,
            created_by: req.auth?.id,
        }
        const rank = await addLanduseServices(data);
        res.json({
            meta: {
                status: 200,
                message: "Landuse added successful"
            },
            data: rank
        });
    } catch (error) {
        next(error);
    }
}

export const getLanduse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ranks = await getLanduseServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: ranks
        })
        
    } catch (error) {
        next(error)
    }
}


export const addPurposeSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        purpose_name: Joi.string().required(),
        landuse_id: Joi.string().guid().required(),
        lease_years: Joi.string().required()
    });
    validateRequest(req, next, schema)
}

export const addPurpose = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const data = {
            ...body,
            created_by: req.auth?.id,
        }
        const rank = await addPurposeServices(data);
        res.json({
            meta: {
                status: 200,
                message: "Purpose added successfully"
            },
            data: rank
        });
    } catch (error) {
        next(error);
    }
}


export const getLanduseAndPurpose = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await getLanduseAndPurposeServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: departments
        })

    } catch (error) {
        next(error)
    }
}


export const getPurposes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ranks = await gePurposesServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: ranks
        })
        
    } catch (error) {
        next(error)
    }
}
export const updatePurposeSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        landuse_id: Joi.string().guid().required(),
        purpose_name: Joi.string().required(), 
        lease_years: Joi.string().required()
    });
    validateRequest(req, next, schema)
}

export const updatePurpose = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
                const data = {
            ...body,
            updated_by: req.auth?.id,
        }
        const rank = await updatePurposeService(data);
        res.json({
            meta: {
                status: 200,
                message: "Purpose updated successfully"
            },
            data: rank
        });
    } catch (error) {
        next(error);
    }
}


export const deletePurpose = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        await deletePurposeService(req.params?.id as string)
        res.json({
            meta: {
                status: 200,
                message: "Purpose deleted successfully"
            },
            data: {
            }
        })
    } catch (error) {
        next(error)
    }
}
