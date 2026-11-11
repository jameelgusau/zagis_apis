import { Request, Response, NextFunction } from "express";
import { getFileDetailsService } from "../services/fileDetails.service";

export const getFileDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const result = await getFileDetailsService(id as string);

        res.status(200).json({
            meta: {
                status: 200,
                message: "Property details retrieved successfully",
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};