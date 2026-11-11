
import { Response, NextFunction } from "express";
import { Request as JWTRequest } from "express-jwt";
import { importBulkFiles } from "../services/bulkFileImport.service";
import { generateBulkImportReport } from "../services/bulkFileReport.service";

export const bulkImportFiles = async (
    req: JWTRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            throw new Error("Please upload an Excel or CSV file");
        }

        const userId = req.auth?.id;

        if (!userId) {
            throw new Error("Authenticated user ID is required");
        }

        const result = await importBulkFiles(
            req.file.buffer,
            userId
        );

        console.log("Bulk import result:", req.query.format);
        // Generate Excel report when requested
        if (req.query.format === "excel") {
            const report = generateBulkImportReport(result);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                'attachment; filename="zagis-bulk-import-report.xlsx"; filename*=UTF-8\'\'zagis-bulk-import-report.xlsx'
            );
            return res.status(200).send(report);
        }

        // Default JSON response remains unchanged
        return res.status(200).json({
            meta: {
                status: 200,
                message: "Bulk property import completed",
            },
            data: result,
        });

    } catch (error) {
        next(error);
    }
};
