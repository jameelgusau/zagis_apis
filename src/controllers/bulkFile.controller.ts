
import { Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
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


export const downloadBulkFileTemplate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headers = [
      "cofo_number",
      "title_holder_name",
      "landuse_id",
      "purpose_id",
      "lga_id",
      "area_sqm",
      "commencement_date",
      "expiry_date",
      "location",
      "registration_date",
      "execution_date",
      "collection_date",
      "page_number",
      "volume_number",
      "serial_number",
      "certificate_type",
      "collected",
    ];

    const instructions = [
      ["ZAGIS BULK PROPERTY REGISTRATION TEMPLATE"],
      [""],
      ["Instructions"],
      ["1. Do not change the column headers."],
      ["2. Fields marked as required must be provided."],
      ["3. Use valid UUIDs for landuse_id, purpose_id and lga_id."],
      ["4. Dates must use YYYY-MM-DD format."],
      ["5. area_sqm must be a positive number."],
      ["6. certificate_type: Certificate, Letter of Grant or Temporary."],
      ["7. collected: Yes or No."],
      [""],
      ["Required columns"],
      ["cofo_number", "Certificate of Occupancy number"],
      ["title_holder_name", "Name of property owner"],
      ["landuse_id", "Land-use UUID"],
      ["purpose_id", "Purpose UUID"],
      ["lga_id", "Local Government Area UUID"],
      ["area_sqm", "Property area in square metres"],
      ["commencement_date", "Grant commencement date"],
      ["expiry_date", "Grant expiry date"],
    ];

    const workbook = XLSX.utils.book_new();

    const propertySheet = XLSX.utils.aoa_to_sheet([headers]);

    propertySheet["!cols"] = headers.map((header) => ({
      wch: Math.max(header.length + 5, 18),
    }));

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);

    instructionSheet["!cols"] = [
      { wch: 35 },
      { wch: 55 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      propertySheet,
      "Properties"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      instructionSheet,
      "Instructions"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="zagis-property-registration-template.xlsx"'
    );

    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};