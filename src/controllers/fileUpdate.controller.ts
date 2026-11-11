
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { updateBasicFileService } from "../services/fileUpdate.service";
import { Request as JWTRequest } from "express-jwt";

const updateBasicFileSchema = Joi.object({
  cofo_number: Joi.string().trim().max(15).optional(),
  title_holder_name: Joi.string().trim().max(255).optional(),
  location: Joi.string().trim().max(100).allow(null, "").optional(),
  lga_id: Joi.string().uuid().optional(),
}).min(1);

export const updateBasicFile = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = updateBasicFileSchema.validate(req.body, {
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

    if (!req.auth?.id) {
      return res.status(401).json({
        meta: {
          status: 401,
          message: "Unauthorized",
        },
      });
    }

    const result = await updateBasicFileService({
      ...value,
      file_id: req.params.id,
      updated_by: req.auth.id,
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
