import { Op } from "sequelize";
import { db } from "../db";

interface fileAttributes {
    rank_name: string;
    department_id: string
}

interface Extern extends fileAttributes {
    id: string
    updated_by: string
}

export const rankService = async (params: fileAttributes) => {
    const findOne = await findRank(params)
    if (findOne) throw "Rank already exist"
    const createRank = new db.Rank(params);
    await createRank.save()
}


export const getRanksServices = async () => {
    const ranks = await db.Rank.findAll({
        order: [['rank_name', 'ASC']],
        include: [
            {
                model: db.Department,
                required: false,
            },
        ],
    });

    const result = ranks.map((file) => {
        const data = file.toJSON();
        return {
            ...(data.department || {}),
            ...data,
            department: undefined,
        };
    });
    return result;
}

export const updateRankService = async (params: Extern) => {
    const { department_id, id, rank_name, updated_by} = params
    const findOne = await findRank(params)
    if (findOne && findOne.id !== params.id) throw "Rank already exist"
    try {
        await db.Rank.update(
            {
                department_id, rank_name, updated_by
            },
            { where: { id } }
        );

    } catch (error) {
        throw error;
    }
}

export const deleteRankService = async (id: string) => {
    const file = await getRank(id);
    await file.destroy()
}

export const getRank = async (id: string) => {
    const file = await db.Rank.findByPk(id);
    if (!file) throw 'Rank not found';
    return file;
}

const findRank = async (params: { department_id: string, rank_name: string }) => {
    const findFile = await db.Rank.findOne({
        where: {
            department_id: params.department_id,
            [Op.and]: [
                {
                    rank_name: {
                        [Op.iLike]: params.rank_name
                    }
                }]
        }
    })
    return findFile
}