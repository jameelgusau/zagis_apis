
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { searchFilesService } from "../services/fileSearch.service";

const searchFilesSchema = Joi.object({
  search: Joi.string().trim().allow("").optional(),
  lga_id: Joi.string().uuid().optional(),
  landuse_id: Joi.string().uuid().optional(),
  purpose_id: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const searchFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = searchFilesSchema.validate(req.query, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        meta: {
          status: 400,
          message: "Validation error",
        },
        errors: error.details.map((detail) => detail.message),
      });
    }

    const result = await searchFilesService(value);

    return res.status(200).json({
      meta: {
        status: 200,
        message: "Properties retrieved successfully",
      },
      data: result.files,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
