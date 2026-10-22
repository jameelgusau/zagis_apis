import { Op } from "sequelize";
import { db } from "../db";

export const addZoneService = async (params: { name: string; description?: string }) => {
    const { name, description } = params;
    const findZone = await db.Zone.findOne({
        where: {
            name: {
                [Op.iLike]: name
            }
        }
    });
    if (findZone) {
        throw "Zone already exists";
    }
    const zone = await db.Zone.create({ name, description });
    return zone;
};

export const updateZoneService = async (params: { zone_id: string; name: string; description?: string }) => {
    const { zone_id, name, description } = params;
    const findZone = await db.Zone.findByPk(zone_id);
    if (!findZone) {
        throw "Zone not found";
    }

        const existingZone = await db.Zone.findOne({
        where: {
            name,
            id: { [Op.ne]: zone_id }
        }
    });

    if (existingZone) {
        throw "Zone name already exists";
    }
    const updatedZone = await findZone.update({ name, description });
    return updatedZone;
}

export const getAllZonesService = async () => {
    const zones = await db.Zone.findAll({
         order: [['name', 'ASC']]
    });
    return zones;
}

export const getZoneByIdService = async (zone_id: string) => {
    const zone = await db.Zone.findByPk(zone_id);
    if (!zone) {
        throw "Zone not found";
    }
    return zone;
}

export const deleteZoneService = async (zone_id: string) => {
    console.log("Deleting zone with ID:", zone_id);
    const zone = await db.Zone.findByPk(zone_id);
    if (!zone) {
        throw "Zone not found";
    }
    await zone.destroy();
    return zone;
}
