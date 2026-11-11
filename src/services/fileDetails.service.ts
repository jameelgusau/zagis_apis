import { db } from "../db";
import { File } from "../models/file.model";

export const getFileDetailsService = async (fileId: string) => {
    const file = await db.File.findByPk(fileId, {
        include: [
            {
                model: db.Record,
            },
            {
                model: db.Landuse,
            },
            {
                model: db.Purpose,
            },
            {
                model: db.LGA,
            },
            {
                model: db.Account,
                as: "creator",
                attributes: ["id", "full_name", "email"],
            },
            {
                model: db.FileGrant,
                as: "grants",
            },
            {
                model: db.FilePurposeHistory,
                as: "purposeHistory",
                include: [
                    {
                        model: db.Purpose,
                        as: "purpose",
                    },
                ],
            },
            {
                model: db.FileAreaHistory,
                as: "areaHistory",
            },
            {
                model: db.FileNameHistory,
                as: "nameHistory",
            },
        ],
    });

    if (!file) {
        throw new Error("Property not found");
    }

    return file;
};