
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";

import {
    addLGAService,
    updateLGAService,
    getAllLGAsService,
    getLGAByIdService,
    deleteLGAService,
} from "../services/lga.service";

export const LGASchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        zone_id: Joi.string().guid().required(),
    });

    validateRequest(req, next, schema);
};

export const LGAUpdateSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        lga_id: Joi.string().guid().required(),
        name: Joi.string().trim().min(1).max(100).required(),
        zone_id: Joi.string().guid().required(),
    });

    validateRequest(req, next, schema);
};

export const addLGA = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const lga = await addLGAService(req.body);

        res.json({
            meta: {
                status: 200,
                message: "LGA added successfully",
            },
            data: lga,
        });
    } catch (error) {
        next(error);
    }
};

export const updateLGA = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const lga = await updateLGAService(req.body);

        res.json({
            meta: {
                status: 200,
                message: "LGA updated successfully",
            },
            data: lga,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllLGAs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const zone_id = req.query.zone_id as string | undefined;
        const lgas = await getAllLGAsService(zone_id);

        res.json({
            meta: {
                status: 200,
                message: "LGAs retrieved successfully",
            },
            data: lgas,
        });
    } catch (error) {
        next(error);
    }
};

export const getLGAById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const lga = await getLGAByIdService(
            req.params.lga_id as string
        );

        res.json({
            meta: {
                status: 200,
                message: "LGA retrieved successfully",
            },
            data: lga,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLGA = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const lga = await deleteLGAService(
            req.params.id as string
        );

        res.json({
            meta: {
                status: 200,
                message: "LGA deleted successfully",
            },
            data: lga,
        });
    } catch (error) {
        next(error);
    }
};