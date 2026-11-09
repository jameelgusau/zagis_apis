
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";
import {
    generateGroundRentAssessment as generateGroundRentAssessmentService,
} from "../services/groundRentAssessmentGeneration.service";

export const generateGroundRentAssessmentSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        fileId: Joi.string().uuid().required(),
        rentYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .required(),
    });
    validateRequest(
        req,
        next,
        schema
    );
}

export const generateGroundRentAssessment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await generateGroundRentAssessmentService({
            fileId: req.body.fileId,
            rentYear: req.body.rentYear,
        });

        res.json({
            meta: {
                status: 200,
                message: "Ground-rent assessment generated successfully",
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
