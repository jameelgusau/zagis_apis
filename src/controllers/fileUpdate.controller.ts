
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";
import { updateBasicFileService, updateFilePurposeService, updateFileAreaService } from "../services/fileUpdate.service";
import { Request as JWTRequest } from "express-jwt";

export const updateBasicFileSchema = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cofo_number: Joi.string().trim().max(15).optional(),
    title_holder_name: Joi.string().trim().max(255).optional(),
    location: Joi.string().trim().max(100).allow(null, "").optional(),
    lga_id: Joi.string().uuid().optional(),
  }).min(1);
  validateRequest(req, next, schema)
}


export const updateBasicFile = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const result = await updateBasicFileService({
      ...req.body,
      file_id: req.params.id,
      updated_by: req.auth?.id,
    });

    return res.status(200).json({
      meta: {
        status: 200,
        message: "Property updated successfully",
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const updateFilePurposeSchema =
  (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      landuse_id: Joi.string()
        .uuid()
        .required()
        .messages({
          "string.guid": "Invalid land use ID",
          "any.required": "Land use is required",
        }),

      purpose_id: Joi.string()
        .uuid()
        .required()
        .messages({
          "string.guid": "Invalid purpose ID",
          "any.required": "Purpose is required",
        }),

      effective_from: Joi.string()
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
        .required()
        .messages({
          "string.isoDate": "Effective date must be a valid date",
          "string.pattern.base": "Effective date must use YYYY-MM-DD format",
          "any.required": "Effective date is required",
        }),
    });
    validateRequest(req, next, schema)
  }

export const updateFilePurpose = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await updateFilePurposeService({
      file_id: id as string,
      landuse_id: req.body.landuse_id,
      purpose_id: req.body.purpose_id,
      effective_from: req.body.effective_from,
      updated_by: req.auth?.id!,
    });

    return res.status(200).json({
      meta: {
        status: true,
        message: "Property purpose updated successfully",
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const updateFileAreaSchema = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    area_sqm: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        "number.base": "Area must be a valid number",
        "number.positive": "Area must be greater than zero",
        "number.precision": "Area can have at most 2 decimal places",
        "any.required": "Area is required",
      }),

    effective_from: Joi.string()
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
      .required()
      .messages({
        "string.isoDate": "Effective date must be a valid date",
        "string.pattern.base": "Effective date must use YYYY-MM-DD format",
        "any.required": "Effective date is required",
      }),
  });
  validateRequest(req, next, schema);
}


export const updateFileArea = async (req: JWTRequest, res: Response, next: NextFunction) => {
  try {
    const result = await updateFileAreaService({
      file_id: req.params.id as string,
      area_sqm: req.body.area_sqm,
      effective_from: req.body.effective_from,
      updated_by: req.auth?.id!,
    });

    return res.status(200).json({
      meta: {
        status: true,
        message: "Property area updated successfully",
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};