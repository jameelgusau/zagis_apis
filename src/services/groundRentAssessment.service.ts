import { db } from "../db";




const getFileWithAssociations = async (file_id: string) => {
const file = await db.File.findByPk(file_id, {
    include: [
        {
            model: db.FileGrant,
            as: "grants",
        },
        {
            model: db.FilePurposeHistory,
            as: "purposeHistory",
        },
        {
            model: db.FileAreaHistory,
            as: "areaHistory",
        },
    ],
})
    return file;
};