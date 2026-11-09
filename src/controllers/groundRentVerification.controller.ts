
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middlewares/validate-request";
import { verifyGroundRentYearServices } from "../services/groundRentVerification.service";

export const VerifyGroundRentYearSchema =
  (req: Request, res: Response, next: NextFunction) => {

    const schema = Joi.object({
      fileId: Joi.string().uuid().required(),
      rentYear: Joi.number().integer().min(1900).required(),
      status: Joi.string().valid("PAID", "UNPAID").required(),
      paymentId: Joi.string().uuid().when("status", {
        is: "PAID",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
      notes: Joi.string().allow("", null).optional(),
    });

    validateRequest(req, next, schema);

  }

export const verifyGroundRentYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { body } = req;

    // Use the authenticated user's ID from your existing auth middleware.
    const verifiedBy = (req as any).auth?.id;

    if (!verifiedBy) {
      throw "Authenticated user ID not found.";
    }

    const result = await verifyGroundRentYearServices({
      fileId: body.fileId,
      rentYear: body.rentYear,
      status: body.status,
      paymentId: body.paymentId,
      notes: body.notes,
      verifiedBy,
    });

    res.json({
      meta: {
        status: 200,
        message: "Ground-rent year verified successfully",
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
