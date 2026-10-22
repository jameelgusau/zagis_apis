
import { Op, WhereOptions } from "sequelize";
import { db } from "../db";

interface CreateLGAInput {
    name: string;
    zone_id: string;
}

interface UpdateLGAInput {
    lga_id: string;
    name: string;
    zone_id: string;
}

export const addLGAService = async (params: CreateLGAInput) => {
    const name = params.name.trim();

    const zone = await db.Zone.findByPk(params.zone_id);

    if (!zone) {
        throw "Zone not found";
    }

    const existingLGA = await db.LGA.findOne({
        where: {
            name: { [Op.iLike]: name },
        },
    });

    if (existingLGA) {
        throw "LGA already exists";
    }

    return db.LGA.create({
        name,
        zone_id: params.zone_id,
    });
};

export const updateLGAService = async (params: UpdateLGAInput) => {
    const { lga_id, zone_id } = params;
    const name = params.name.trim();

    const lga = await db.LGA.findByPk(lga_id);

    if (!lga) {
        throw "LGA not found";
    }

    const zone = await db.Zone.findByPk(zone_id);

    if (!zone) {
        throw "Zone not found";
    }

    const existingLGA = await db.LGA.findOne({
        where: {
            name: { [Op.iLike]: name },
            id: { [Op.ne]: lga_id },
        },
    });

    if (existingLGA) {
        throw "Another LGA already uses this name";
    }

    return lga.update({
        name,
        zone_id,
    });
};

export const getAllLGAsService = async (zone_id?: string) => {
    const where: WhereOptions = {};

    if (zone_id) {
        where.zone_id = zone_id;
    }

    return db.LGA.findAll({
        where,
        include: [
            {
                model: db.Zone,
                as: "zone",
                attributes: ["id", "name"],
            },
        ],
        order: [["name", "ASC"]],
    });
};

export const getLGAByIdService = async (lga_id: string) => {
    const lga = await db.LGA.findByPk(lga_id, {
        include: [
            {
                model: db.Zone,
                as: "zone",
                attributes: ["id", "name"],
            },
        ],
    });

    if (!lga) {
        throw "LGA not found";
    }

    return lga;
};

export const deleteLGAService = async (lga_id: string) => {
    const lga = await db.LGA.findByPk(lga_id);

    if (!lga) {
        throw "LGA not found";
    }

    const linkedFiles = await db.File.count({
        where: { lga_id },
    });

    if (linkedFiles > 0) {
        throw "Cannot delete this LGA because files are linked to it"
        
    }

    await lga.destroy();

    return lga;
};