import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { addZoneService, deleteZoneService, getAllZonesService, getZoneByIdService, updateZoneService } from "../services/zone.service";
import { db } from "../db";

export const ZoneSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow(null, "").optional(),
    });
    validateRequest(req, next, schema)
}

export const ZoneUpdateSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        zone_id: Joi.string().guid().required(),
        name: Joi.string().required(),
        description: Joi.string().allow(null, "").optional()
    });
    validateRequest(req, next, schema)
}

export const addZone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const zone = await addZoneService(body)
        res.json({
            meta: {
                status: 200,
                message: "Zone added successfully"
            },
            data: zone
        });
    } catch (error) {
        next(error);
    }
}

export const updateZone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const zone = await updateZoneService(body)
        res.json({
            meta: {
                status: 200,
                message: "Zone updated successfully"
            },
            data: zone
        });
    } catch (error) {
        next(error);
    }
}

export const getAllZones = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const zones = await getAllZonesService();
        res.json({
            meta: {
                status: 200,
                message: "Zones retrieved successfully"
            },
            data: zones
        });
    } catch (error) {
        next(error);
    }
}

export const getZoneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { zone_id } = req.params;
        const zone = await getZoneByIdService(zone_id as string);
        res.json({
            meta: {
                status: 200,
                message: "Zone retrieved successfully"
            },
            data: zone
        });
    } catch (error) {
        next(error);
    }
}

export const deleteZone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const zone = await deleteZoneService(id as string);
        res.json({
            meta: {
                status: 200,
                message: "Zone deleted successfully"
            },
            data: zone
        });
    } catch (error) {
        next(error);
    }
}
