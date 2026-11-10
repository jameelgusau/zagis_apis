
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";
import {
    previewBulkGroundRentAssessments as previewBulkGroundRentAssessmentsService,
} from "../services/bulkGroundRentAssessmentPreview.service";

export const BulkGroundRentAssessmentPreviewSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        rentYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .required(),

        fileIds: Joi.array()
            .items(Joi.string().uuid())
            .min(1)
            .unique()
            .optional(),
    });
        validateRequest(req, next, schema)
}

export const previewBulkGroundRentAssessments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const result =
            await previewBulkGroundRentAssessmentsService({
                rentYear: req.body.rentYear,
                fileIds: req.body.fileIds,
            });

        res.json({
            meta: {
                status: 200,
                message: "Bulk ground-rent assessment preview generated successfully.",
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
