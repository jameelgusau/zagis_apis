import { promises as fsPromises } from "fs";
import fs from 'fs';
import { Op } from "sequelize";
import { db } from "../db";

interface FileAttributes {
    cofo_number: string;
    title_holder_name: string;
    landuse_id: string;
    purpose_id: string;
    lga_id: string;
    area_sqm: number 
    location?: string | null;

    // Original grant details
    commencement_date: string;
    expiry_date: string;

    // Record details
    registration_date?: string | null;
    execution_date?: string | null;
    collection_date?: string | null;
    page_number?: number | null;
    volume_number?: number | null;
    serial_number?: number | null;
    certificate_type?: "Certificate" | "Letter of Grant" | "Temporary" | null;
    collected?: "Yes" | "No" | null;

    created_by: string;
}

// Convert an ISO date string to a Date object for Sequelize
const toDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;

    if (value instanceof Date) {
        return value;
    }

    return new Date(`${value.substring(0, 10)}T00:00:00.000Z`);
};

interface Extern {
    cofo_number: string;
    title_holder_name: string;
    landuse_id: string
    purpose_id: string
    file_id: string;
    updated_by: string
}

export const fileService = async (params: FileAttributes) => {
    const transaction = await db.sequelize.transaction();

    try {
        const cofoNumber = params.cofo_number.trim().toUpperCase();

        // Check for an existing property
        const existingFile = await db.File.findOne({
            where: {
                cofo_number: {
                    [Op.iLike]: cofoNumber,
                },
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (existingFile) {
            throw new Error(`Property with COFO number ${cofoNumber} already exists`);
        }

        // 1. Create property
        const file = await db.File.create(
            {
                cofo_number: cofoNumber,
                title_holder_name: params.title_holder_name.trim().toUpperCase(),
                location: params.location || null,
                landuse_id: params.landuse_id,
                purpose_id: params.purpose_id,
                lga_id: params.lga_id,
                area_sqm: params.area_sqm,
                created_by: params.created_by,
            },
            { transaction }
        );

        // 2. Create certificate/registration record
        const record = await db.Record.create(
            {
                file_id: file.id,
                registration_date: toDate(params.registration_date),
                execution_date: toDate(params.execution_date),
                collection_date: toDate(params.collection_date),
                page_number: params.page_number ?? null,
                volume_number: params.volume_number ?? null,
                serial_number: params.serial_number ?? null,
                certificate_type: params.certificate_type ?? null,
                collected: params.collected ?? "No",
                created_by: params.created_by,
            },
            { transaction }
        );

        const commencementDate = toDate(params.commencement_date)!;

        // 3. Create original grant
        const grant = await db.FileGrant.create(
            {
                file_id: file.id,
                grant_type: "ORIGINAL",
                commencement_date: commencementDate,
                expiry_date: toDate(params.expiry_date)!,
            },
            { transaction }
        );

        // 4. Create initial purpose history
        const purposeHistory = await db.FilePurposeHistory.create(
            {
                file_id: file.id,
                purpose_id: params.purpose_id,
                effective_from: commencementDate,
                effective_to: null,
            },
            { transaction }
        );

        // 5. Create initial area history
        const areaHistory = await db.FileAreaHistory.create(
            {
                file_id: file.id,
                area_sqm: String(params.area_sqm),
                effective_from: commencementDate,
                effective_to: null,
            },
            { transaction }
        );

        // 6. Create initial title-holder history
        const nameHistory = await db.FileNameHistory.create(
            {
                file_id: file.id,
                title_holder_name: params.title_holder_name.trim().toUpperCase(),
                effective_from: commencementDate,
                effective_to: null,
            },
            { transaction }
        );

        await transaction.commit();

        return {
            ...file.toJSON(),
            record: record.toJSON(),
            grant: grant.toJSON(),
            purposeHistory: purposeHistory.toJSON(),
            areaHistory: areaHistory.toJSON(),
            nameHistory: nameHistory.toJSON(),
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export const getFilesServices = async () => {
    const records = await db.File.findAll({
        order: [['cofo_number', 'ASC']],
        include: [
            {
                model: db.Record,
                required: false,
            },
        ],
    });
    // const records = users.map((user) => basicUserDetails(user));
    const result = records.map((file) => {
        const data = file.toJSON();
        return {
            ...data,
            ...(data.record || {}),
            record: undefined,
        };
    });
    return result
}


export const updateFileService = async (params: Extern) => {
    const { cofo_number,
        title_holder_name, landuse_id,
        purpose_id, updated_by, file_id, ...rest } = params
    const t = await db.sequelize.transaction();
    try {
        await db.File.update(
        params,
            { where: { id: file_id }, transaction: t }
        );

        await db.Record.upsert(
            {
                ...params,
                file_id,
            
            },
            { transaction: t }
        );

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
}

export const deleteFileService = async (id: string) => {
    const file = await getFile(id);
    await file.destroy()
}

export const getFile = async (id: string) => {
    const file = await db.File.findByPk(id);
    if (!file) throw 'File not found';
    return file;
}