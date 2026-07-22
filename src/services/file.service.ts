import { promises as fsPromises } from "fs";
import fs from 'fs';
import { Op } from "sequelize";
import { db } from "../db";

interface fileAttributes {
    cofo_number: string;
    title_holder_name: string;
    landuse_id: string
    purpose_id: string
}

interface Extern extends fileAttributes {
    file_id: string;
    updated_by?: string
}

export const fileService = async (params: fileAttributes) => {
    const {
        cofo_number,
        title_holder_name,
        landuse_id,
        purpose_id,
        ...recordData
    } = params;
    const findFile = await db.File.findOne({
        where: {
            cofo_number: {
                [Op.iLike]: params.cofo_number
            }
        }
    })
    if (findFile) throw "File already exist"
    const sequelize = db.sequelize;
    const transaction = await sequelize.transaction();

    try {
        const file = await db.File.create(
            {
                cofo_number,
                title_holder_name,
                landuse_id,
                purpose_id,
            },
            { transaction }
        );

        await db.Record.create(
            {
                ...recordData,
                file_id: file.id,
            },
            { transaction }
        );

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}



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
            {
                cofo_number,
                title_holder_name,
                landuse_id,
                purpose_id,
                updated_by
            },
            { where: { id: file_id }, transaction: t }
        );

        await db.Record.upsert(
            {
                ...rest,
                file_id,
                updated_by
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