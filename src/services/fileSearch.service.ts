
import { Op, WhereOptions } from "sequelize";
import { db } from "../db";

interface FileSearchParams {
    search?: string;
    lga_id?: string;
    landuse_id?: string;
    purpose_id?: string;
    page?: number;
    limit?: number;
}

export const searchFilesService = async (params: FileSearchParams) => {
    const {
        search,
        lga_id,
        landuse_id,
        purpose_id,
        page = 1,
        limit = 10,
    } = params;

    const where: WhereOptions = {
        ...(search?.trim()
            ? {
                [Op.or]: [
                    { cofo_number: { [Op.iLike]: `%${search.trim()}%` } },
                    { title_holder_name: { [Op.iLike]: `%${search.trim()}%` } },
                ],
            }
            : {}),
        ...(lga_id ? { lga_id } : {}),
        ...(landuse_id ? { landuse_id } : {}),
        ...(purpose_id ? { purpose_id } : {}),
    };

    const offset = (page - 1) * limit;

    const { count, rows } = await db.File.findAndCountAll({
        where,
        include: [
            { model: db.Record },
            { model: db.Landuse },
            { model: db.Purpose },
            { model: db.LGA },
        ],
        limit,
        offset,
        order: [["cofo_number", "ASC"]],
        distinct: true,
    });

    return {
        files: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};
