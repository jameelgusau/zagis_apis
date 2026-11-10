
import { Request, Response, NextFunction } from "express";
import { previewBulkFiles } from "../services/bulkFilePreview.service";

export const bulkPreviewFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            throw "Please upload an Excel or CSV file";
        }

        const result = await previewBulkFiles(req.file.buffer);

        res.status(200).json({
            meta: {
                status: 200,
                message: "Bulk property preview generated successfully",
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
