import { Op, where } from "sequelize";
import { db } from "../db";

interface LandusAttributes {
    landuse_name: string;
    created_by: string;
}

interface PurposeAttributes {
    purpose_name: string;
    landuse_id: string;
    lease_years: string;
    created_by: string;
}

interface UpdatePurposeAttributes {
    id: string;
    purpose_name: string;
    landuse_id: string;
    lease_years: string;
    updated_by: string;
}




export const addLanduseServices = async (params: LandusAttributes) => {
    const findOne = await db.Landuse.findOne({
        where: {
            landuse_name: {
                [Op.iLike]: params.landuse_name
            }
        }
    })
    if (findOne) throw "Landuse already exist"
    const createLanduse = new db.Landuse(params);
    await createLanduse.save()
}

export const getLanduseServices = async () => {
    const landuses = await db.Landuse.findAll()
    return landuses
}

export const addPurposeServices = async (params: PurposeAttributes) => {
    const data = {
        ...params,
        lease_years: Number(params.lease_years)
    }
    const findOne = await db.Purpose.findOne({
        where: {
            [Op.and]: [{
                landuse_id: params.landuse_id
            }, {
                purpose_name: {
                    [Op.iLike]: params.purpose_name
                }
            }]
        }
    })
    if (findOne) throw "Purpose already exist"
    const createLanduse = new db.Purpose(data);
    await createLanduse.save()
}

export const gePurposesServices = async () => {
    const records = await db.Purpose.findAll({
        include: [
            {
                model: db.Landuse,
                required: false,
            }
        ]
    })
    const result = records.map((landuse) => {
        const data = landuse.toJSON();
        return {
            ...(data.landuse || {}),
            ...data,
            record: undefined,
        };
    })
    return result
}

export const updatePurposeService = async (params: UpdatePurposeAttributes) => {
    const { landuse_id, id, purpose_name, lease_years, updated_by } = params
    const purpose = await getPurpose(id)
    const findOne = await db.Purpose.findOne({
        where: {
            [Op.and]: [
                {
                    purpose_name: {
                        [Op.iLike]: purpose_name
                    }
                }, {
                    landuse_id
                }
            ]
        }
    })
    if (findOne && findOne.id !== params.id) throw "Purpose already exist"

    Object.assign(purpose, params);
    await purpose.save()
}

export const getLanduseAndPurposeServices = async ()=>{
    const landuses = await db.Landuse.findAll({
        order: [['landuse_name', 'ASC']],
        include: [{
            model: db.Purpose,
            as: "detailedLanduses"
        }]
    })
    return landuses;
}

export const deletePurposeService = async (id: string) => {
    const file = await getPurpose(id);
    await file.destroy()
}

export const getPurpose = async (id: string) => {
    const purpose = await db.Purpose.findByPk(id);
    if (!purpose) throw 'Purpose not found';
    return purpose;
}
