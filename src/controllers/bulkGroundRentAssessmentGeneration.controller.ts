
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";
import {
    bulkGenerateGroundRentAssessments as bulkGenerateGroundRentAssessmentsService,
} from "../services/bulkGroundRentAssessmentGeneration.service";

export const bulkGenerateGroundRentAssessmentsSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        rentYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .required(),

        // Omit fileIds to process all property files.
        fileIds: Joi.array()
            .items(Joi.string().uuid().required())
            .min(1)
            .unique()
            .optional(),
    });
    validateRequest(
        req,
        next,
        schema
    );
}

export const bulkGenerateGroundRentAssessments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {


        const result =
            await bulkGenerateGroundRentAssessmentsService({
                rentYear: req.body.rentYear,
                fileIds: req.body.fileIds,
            });

        res.json({
            meta: {
                status: 200,
                message: "Bulk ground-rent assessment processing completed.",
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
