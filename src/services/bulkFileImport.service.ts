
import { previewBulkFiles } from "./bulkFilePreview.service";
import { fileService } from "./file.service";

export interface ImportResult {
    rowNumber: number;
    status: "IMPORTED" | "FAILED" | "INVALID";
    cofo_number: string | null;
    message: string;
    errors: string[];
}

export interface BulkImportSummary {
    total_rows: number;
    imported_rows: number;
    failed_rows: number;
    invalid_rows: number;
    successful: boolean;
}

export interface BulkImportResponse {
    summary: BulkImportSummary;
    results: ImportResult[];
}

export const importBulkFiles = async (
    buffer: Buffer,
    createdBy: string
): Promise<BulkImportResponse> => {
    if (!createdBy) {
        throw "Authenticated user ID is required";
    }

    // Validate the spreadsheet again before importing.
    const preview = await previewBulkFiles(buffer);

    const results: ImportResult[] = [];

    // Import rows one at a time.
    for (const row of preview.results) {
        const cofoNumber = row.data?.cofo_number
            ? String(row.data.cofo_number)
            : null;

        // Preserve invalid rows from the preview.
        if (row.status === "INVALID" || !row.data) {
            results.push({
                rowNumber: row.rowNumber,
                status: "INVALID",
                cofo_number: cofoNumber,
                message: "Property was not imported because validation failed",
                errors: row.errors,
            });

            continue;
        }

        try {
            // Reuse the same service used for single-property registration.
        await fileService({
                ...row.data,
                created_by: createdBy,
            });

            results.push({
                rowNumber: row.rowNumber,
                status: "IMPORTED",
                cofo_number: cofoNumber,
                message: "Property registered successfully",
                errors: [],
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            results.push({
                rowNumber: row.rowNumber,
                status: "FAILED",
                cofo_number: cofoNumber,
                message: "Property registration failed",
                errors: [message],
            });
        }
    }

    const importedCount = results.filter(
        row => row.status === "IMPORTED"
    ).length;

    const failedCount = results.filter(
        row => row.status === "FAILED"
    ).length;

    const invalidCount = results.filter(
        row => row.status === "INVALID"
    ).length;

    return {
        summary: {
            total_rows: results.length,
            imported_rows: importedCount,
            failed_rows: failedCount,
            invalid_rows: invalidCount,
            successful: importedCount > 0,
        },
        results,
    };
};
