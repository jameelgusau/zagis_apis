
import * as XLSX from "xlsx";
import { BulkImportResponse } from "./bulkFileImport.service";

export const generateBulkImportReport = (
    importResult: BulkImportResponse
): Buffer => {
    const workbook = XLSX.utils.book_new();

    // Summary worksheet
    const summaryData = [
        ["ZAGIS BULK PROPERTY IMPORT REPORT"],
        [],
        ["Import Summary", "Count"],
        ["Total Rows", importResult.summary.total_rows],
        ["Successfully Imported", importResult.summary.imported_rows],
        ["Failed Imports", importResult.summary.failed_rows],
        ["Invalid Rows", importResult.summary.invalid_rows],
        [],
        ["Generated Status", importResult.summary.successful ? "SUCCESS" : "NO SUCCESSFUL IMPORTS"],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    summarySheet["!cols"] = [
        { wch: 35 },
        { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );

    // Detailed results worksheet
    const details = importResult.results.map((row) => ({
        row_number: row.rowNumber,
        cofo_number: row.cofo_number ?? "",
        status: row.status,
        message: row.message,
        errors: row.errors.join("; "),
    }));

    const detailsSheet = XLSX.utils.json_to_sheet(details);

    detailsSheet["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 45 },
        { wch: 70 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        detailsSheet,
        "Import Results"
    );

    return XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    }) as Buffer;
};
