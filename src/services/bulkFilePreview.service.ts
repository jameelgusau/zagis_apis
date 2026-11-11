
import * as XLSX from "xlsx";
import Joi from "joi";
import { Op, fn, col, where } from "sequelize";
import { db } from "../db";
import { FileAttributes } from "./file.service";

interface PreviewRow {
    rowNumber: number;
    status: "VALID" | "INVALID";
    errors: string[];
    data: Omit<FileAttributes, "created_by"> | null;
}

const allowedColumns = [
    "cofo_number",
    "title_holder_name",
    "landuse_name",
    "purpose_name",
    "lga_name",
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

const bulkFileSchema = Joi.object({
    cofo_number: Joi.string().trim().required(),
    title_holder_name: Joi.string().trim().required(),

    landuse_name: Joi.string().trim().required(),
    purpose_name: Joi.string().trim().required(),
    lga_name: Joi.string().trim().required(),

    area_sqm: Joi.number().positive().precision(2).required(),

    commencement_date: Joi.date().required(),
    expiry_date: Joi.date()
        .greater(Joi.ref("commencement_date"))
        .required(),

    location: Joi.string().allow("", null).optional(),

    registration_date: Joi.date().allow(null).optional(),
    execution_date: Joi.date().allow(null).optional(),
    collection_date: Joi.date().allow(null).optional(),

    page_number: Joi.number().integer().positive().allow(null).optional(),
    volume_number: Joi.number().integer().positive().allow(null).optional(),
    serial_number: Joi.number().integer().positive().allow(null).optional(),

    certificate_type: Joi.string()
        .valid("Certificate", "Letter of Grant", "Temporary")
        .allow(null)
        .optional(),

    collected: Joi.string()
        .valid("Yes", "No")
        .allow(null)
        .optional(),
});


const resolveReferenceIds = async (data: any) => {
    const [landuse, purpose, lga] = await Promise.all([
        db.Landuse.findOne({
            where: {
                landuse_name: {
                    [Op.iLike]: data.landuse_name.trim(),
                },
            },
        }),

        db.Purpose.findOne({
            where: {
                purpose_name: {
                    [Op.iLike]: data.purpose_name.trim(),
                },
            },
        }),

        db.LGA.findOne({
            where: {
                name: {
                    [Op.iLike]: data.lga_name.trim(),
                },
            },
        }),
    ]);

    const errors: string[] = [];

    if (!landuse) {
        errors.push(`Landuse "${data.landuse_name}" was not found`);
    }

    if (!purpose) {
        errors.push(`Purpose "${data.purpose_name}" was not found`);
    }

    if (!lga) {
        errors.push(`LGA "${data.lga_name}" was not found`);
    }

    if (errors.length) {
        return { errors, data: null };
    }

    if (purpose!.landuse_id !== landuse!.id) {
        errors.push(
            `Purpose "${data.purpose_name}" does not belong to landuse "${data.landuse_name}"`
        );

        return { errors, data: null };
    }

    // Remove the spreadsheet name fields.
    const {
        landuse_name,
        purpose_name,
        lga_name,
        ...fileData
    } = data;

    return {
        errors: [],
        data: {
            ...fileData,
            landuse_id: landuse!.id,
            purpose_id: purpose!.id,
            lga_id: lga!.id,
            landuse_name,
            purpose_name,
            lga_name,
        },
    };
};

// Convert Excel dates and date strings into YYYY-MM-DD
const normalizeDate = (value: any): string | null => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }

    // Excel serial date
    if (typeof value === "number") {
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) return null;

        const year = String(parsed.y).padStart(4, "0");
        const month = String(parsed.m).padStart(2, "0");
        const day = String(parsed.d).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) return null;

    return date.toISOString().slice(0, 10);
};

const normalizeRow = (row: Record<string, any>) => {
    const normalized: Record<string, any> = {};

    for (const [key, value] of Object.entries(row)) {
        const column = key
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        if (!allowedColumns.includes(column)) continue;

        normalized[column] =
            typeof value === "string" ? value.trim() : value;
    }

    // Normalize dates
    for (const field of [
        "commencement_date",
        "expiry_date",
        "registration_date",
        "execution_date",
        "collection_date",
    ]) {
        normalized[field] = normalizeDate(normalized[field]);
    }

    // Normalize empty optional fields
    for (const field of [
        "location",
        "registration_date",
        "execution_date",
        "collection_date",
        "page_number",
        "volume_number",
        "serial_number",
        "certificate_type",
        "collected",
    ]) {
        if (
            normalized[field] === "" ||
            normalized[field] === undefined
        ) {
            normalized[field] = null;
        }
    }

    if (normalized.cofo_number) {
        normalized.cofo_number =
            String(normalized.cofo_number).trim().toUpperCase();
    }

    if (normalized.title_holder_name) {
        normalized.title_holder_name =
            String(normalized.title_holder_name).trim().toUpperCase();
    }

    return normalized;
};

export const previewBulkFiles = async (
    buffer: Buffer
) => {
    if (!buffer || buffer.length === 0) {
        throw "Please upload a valid spreadsheet";
    }

    // Read spreadsheet
    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw "The uploaded spreadsheet has no worksheet";
    }

    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
        worksheet,
        {
            defval: null,
            raw: true,
        }
    );

    if (!rawRows.length) {
        throw "The uploaded spreadsheet contains no data";
    }

    const results: PreviewRow[] = [];

    // Normalize all rows
    const normalizedRows = rawRows.map((row, index) => ({
        rowNumber: index + 2,
        data: normalizeRow(row),
    }));

    // Find duplicate COFO numbers within the spreadsheet
    const cofoCounts = new Map<string, number>();

    for (const row of normalizedRows) {
        const cofo = row.data.cofo_number;

        if (cofo) {
            cofoCounts.set(
                cofo,
                (cofoCounts.get(cofo) || 0) + 1
            );
        }
    }

    const cofoNumbers = [
        ...new Set(
            normalizedRows
                .map(row => row.data.cofo_number)
                .filter(Boolean)
        ),
    ];

    // Find existing properties in the database
    const existingFiles = cofoNumbers.length
        ? await db.File.findAll({
            attributes: ["cofo_number"],
            where: where(
                fn("UPPER", col("cofo_number")),
                { [Op.in]: cofoNumbers }
            ),
        })
        : [];

    const existingCofoNumbers = new Set(
        existingFiles.map((file: any) =>
            String(file.cofo_number).toUpperCase()
        )
    );

    // Validate each row
    for (const row of normalizedRows) {
        const errors: string[] = [];

        const { error, value } = bulkFileSchema.validate(
            row.data,
            {
                abortEarly: false,
                convert: true,
            }
        );

        if (error) {
            errors.push(
                ...error.details.map(detail => detail.message)
            );
        }

        const cofo = row.data.cofo_number;

        if (cofo && (cofoCounts.get(cofo) || 0) > 1) {
            errors.push(
                `COFO number "${cofo}" appears more than once in the spreadsheet`
            );
        }

        if (cofo && existingCofoNumbers.has(cofo)) {
            errors.push(
                `COFO number "${cofo}" already exists in the database`
            );
        }

        // Check reference IDs exist in the database
        let resolvedData: Omit<FileAttributes, "created_by"> | null = null;

        if (!error) {
            const referenceResult = await resolveReferenceIds(value);

            errors.push(...referenceResult.errors);

            if (referenceResult.data) {
                resolvedData = referenceResult.data as Omit<
                    FileAttributes,
                    "created_by"
                >;
            }
        }

        results.push({
            rowNumber: row.rowNumber,
            status: errors.length ? "INVALID" : "VALID",
            errors,
            data: errors.length ? null : resolvedData,
        });
    }

    const validCount = results.filter(
        row => row.status === "VALID"
    ).length;

    const invalidCount = results.length - validCount;


    return {
        summary: {
            total_rows: results.length,
            valid_rows: validCount,
            invalid_rows: invalidCount,
            can_import: validCount > 0,
        },
        results,
    };
};
