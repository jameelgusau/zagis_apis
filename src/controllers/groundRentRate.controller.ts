
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";

import {
    addGroundRentRateService,
    updateGroundRentRateService,
    getAllGroundRentRatesService,
    getGroundRentRateByIdService,
    deleteGroundRentRateService,
} from "../services/groundRentRate.service";

const dateSchema = Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
        const date = new Date(`${value}T00:00:00.000Z`);

        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== value
        ) {
            return helpers.error("date.format");
        }

        return value;
    })
    .messages({
        "string.pattern.base": "Date must use YYYY-MM-DD format",
        "date.format": "Please provide a valid calendar date",
    });

const groundRentRateFields = {
    lga_id: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).required(),
    purpose_id: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).required(),
    rate_per_sqm: Joi.number().positive().precision(4).required(),
    effective_from: dateSchema.required(),
    effective_to: dateSchema.allow(null).optional(),
};

// Create rate
export const GroundRentRateSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object(groundRentRateFields);
    validateRequest(req, next, schema);
};

// Update rate
export const GroundRentRateUpdateSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        rate_id: Joi.string()
            .guid({ version: ["uuidv4", "uuidv5"] })
            .required(),
        ...groundRentRateFields,
    });

    validateRequest(req, next, schema);
};

// Validate list filters from query string
export const getAllGroundRentRatesSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        lga_id: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).optional(),
        purpose_id: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).optional(),
        effective_year: Joi.number()
            .integer()
            .min(1900)
            .max(9999)
            .optional(),
    });

    const { error } = schema.validate(req.query);

    if (error) {
        return next(error);
    }

    next();
};

// Create
export const addGroundRentRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rate = await addGroundRentRateService(req.body);

        res.json({
            meta: {
                status: 200,
                message: "Ground rent rate added successfully",
            },
            data: rate,
        });
    } catch (error) {
        next(error);
    }
};

// Update
export const updateGroundRentRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rate = await updateGroundRentRateService(req.body);

        res.json({
            meta: {
                status: 200,
                message: "Ground rent rate updated successfully",
            },
            data: rate,
        });
    } catch (error) {
        next(error);
    }
};

// List
export const getAllGroundRentRates = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const filters = {
            lga_id: req.query.lga_id as string | undefined,
            purpose_id: req.query.purpose_id as string | undefined,
            effective_year:
                req.query.effective_year !== undefined
                    ? Number(req.query.effective_year)
                    : undefined,
        };

        const rates = await getAllGroundRentRatesService(filters);

        res.json({
            meta: {
                status: 200,
                message: "Ground rent rates retrieved successfully",
            },
            data: rates,
        });
    } catch (error) {
        next(error);
    }
};

// Get one
export const getGroundRentRateById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rate = await getGroundRentRateByIdService(
            req.params.rate_id as string
        );

        res.json({
            meta: {
                status: 200,
                message: "Ground rent rate retrieved successfully",
            },
            data: rate,
        });
    } catch (error) {
        next(error);
    }
};

// Delete
export const deleteGroundRentRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rate = await deleteGroundRentRateService(
            req.params.rate_id as string
        );

        res.json({
            meta: {
                status: 200,
                message: "Ground rent rate deleted successfully",
            },
            data: rate,
        });
    } catch (error) {
        next(error);
    }
};
