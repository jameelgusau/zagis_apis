
import { Request, Response, NextFunction } from "express";
// import Joi from "joi";
// import validateRequest from "../middlewares/validate-request";
import { getGroundRentHistory as getGroundRentHistoryService } from "../services/groundRentHistory.service";

// const GetGroundRentHistorySchema = Joi.object({
//   fileId: Joi.string().uuid().required(),
// });

export const getGroundRentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getGroundRentHistoryService({
      fileId: req.params.fileId as string,
    });

    res.json({
      meta: {
        status: 200,
        message: "Ground-rent history retrieved successfully",
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
