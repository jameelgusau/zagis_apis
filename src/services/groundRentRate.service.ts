
import { Op, WhereOptions } from "sequelize";
import { db } from "../db";

interface CreateGroundRentRateInput {
    lga_id: string;
    purpose_id: string;
    rate_per_sqm: number;
    effective_from: string;
    effective_to?: string | null;
}

interface UpdateGroundRentRateInput extends CreateGroundRentRateInput {
    rate_id: string;
}

interface GroundRentRateFilters {
    lga_id?: string;
    purpose_id?: string;
    effective_year?: number;
}

const validateEffectivePeriod = (
    effective_from: string,
    effective_to?: string | null
) => {
    if (Number.isNaN(Date.parse(effective_from))) {
        throw new Error("Invalid effective_from date");
    }

    if (effective_to && Number.isNaN(Date.parse(effective_to))) {
        throw new Error("Invalid effective_to date");
    }

    if (effective_to && effective_to < effective_from) {
        throw new Error(
            "effective_to must be on or after effective_from"
        );
    }
};

const checkRelatedRecords = async (
    lga_id: string,
    purpose_id: string
) => {
    const lga = await db.LGA.findByPk(lga_id);

    if (!lga) {
        throw new Error("LGA not found");
    }

    const purpose = await db.Purpose.findByPk(purpose_id);

    if (!purpose) {
        throw new Error("Purpose not found");
    }
};

const checkOverlappingRate = async (params: {
    lga_id: string;
    purpose_id: string;
    effective_from: string;
    effective_to?: string | null;
    exclude_id?: string;
}) => {
    const {
        lga_id,
        purpose_id,
        effective_from,
        effective_to,
        exclude_id,
    } = params;

    const where: WhereOptions = {
        lga_id,
        purpose_id,
        effective_from: {
            [Op.lte]: effective_to ?? "9999-12-31",
        },
        [Op.or]: [
            { effective_to: null },
            {
                effective_to: {
                    [Op.gte]: effective_from,
                },
            },
        ],
    };

    if (exclude_id) {
        where.id = { [Op.ne]: exclude_id };
    }

    const existingRate = await db.GroundRentRate.findOne({ where });

    if (existingRate) {
        throw new Error(
            "A ground rent rate already exists for this LGA and purpose during the specified effective period"
        );
    }
};

export const addGroundRentRateService = async (
    params: CreateGroundRentRateInput
) => {
    const {
        lga_id,
        purpose_id,
        rate_per_sqm,
        effective_from,
        effective_to = null,
    } = params;

    if (
        typeof rate_per_sqm !== "number" ||
        !Number.isFinite(rate_per_sqm) ||
        rate_per_sqm <= 0
    ) {
        throw new Error("rate_per_sqm must be a positive number");
    }

    validateEffectivePeriod(effective_from, effective_to);

    await checkRelatedRecords(lga_id, purpose_id);

    await checkOverlappingRate({
        lga_id,
        purpose_id,
        effective_from,
        effective_to,
    });

    return db.GroundRentRate.create({
        lga_id,
        purpose_id,
        rate_per_sqm,
        effective_from: new Date(`${effective_from}T00:00:00.000Z`),
        effective_to: effective_to
            ? new Date(`${effective_to}T00:00:00.000Z`)
            : null,
    });
};

export const updateGroundRentRateService = async (
    params: UpdateGroundRentRateInput
) => {
    const {
        rate_id,
        lga_id,
        purpose_id,
        rate_per_sqm,
        effective_from,
        effective_to = null,
    } = params;

    const rate = await db.GroundRentRate.findByPk(rate_id);

    if (!rate) {
        throw new Error("Ground rent rate not found");
    }

    if (
        typeof rate_per_sqm !== "number" ||
        !Number.isFinite(rate_per_sqm) ||
        rate_per_sqm <= 0
    ) {
        throw new Error("rate_per_sqm must be a positive number");
    }

    validateEffectivePeriod(effective_from, effective_to);

    await checkRelatedRecords(lga_id, purpose_id);

    await checkOverlappingRate({
        lga_id,
        purpose_id,
        effective_from,
        effective_to,
        exclude_id: rate_id,
    });

    return rate.update({
        lga_id,
        purpose_id,
        rate_per_sqm,
        effective_from: new Date(`${effective_from}T00:00:00.000Z`),
        effective_to: effective_to
            ? new Date(`${effective_to}T00:00:00.000Z`)
            : null,
    });
};

export const getAllGroundRentRatesService = async (
    filters: GroundRentRateFilters = {}
) => {
    const where: WhereOptions = {};

    if (filters.lga_id) {
        Object.assign(where, { lga_id: filters.lga_id });
    }

    if (filters.purpose_id) {
        Object.assign(where, { purpose_id: filters.purpose_id });
    }

    if (filters.effective_year !== undefined) {
        const year = filters.effective_year;

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > 9999
        ) {
            throw new Error("Invalid effective_year");
        }

        const yearStart = `${year}-01-01`;
        const yearEnd = `${year}-12-31`;

        Object.assign(where, {
            effective_from: { [Op.lte]: yearEnd },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: yearStart } },
            ],
        });
    }

    return db.GroundRentRate.findAll({
        where,
        include: [
            {
                model: db.LGA,
                as: "lga",
                attributes: ["id", "name", "zone_id"],
                include: [
                    {
                        model: db.Zone,
                        as: "zone",
                        attributes: ["id", "name"],
                    },
                ],
            },
            {
                model: db.Purpose,
                as: "purpose",
            },
        ],
        order: [
            ["effective_from", "DESC"],
            ["created_at", "DESC"],
        ],
    });
};

export const getGroundRentRateByIdService = async (
    rate_id: string
) => {
    const rate = await db.GroundRentRate.findByPk(rate_id, {
        include: [
            {
                model: db.LGA,
                as: "lga",
                attributes: ["id", "name", "zone_id"],
                include: [
                    {
                        model: db.Zone,
                        as: "zone",
                        attributes: ["id", "name"],
                    },
                ],
            },
            {
                model: db.Purpose,
                as: "purpose",
            },
        ],
    });

    if (!rate) {
        throw new Error("Ground rent rate not found");
    }

    return rate;
};

export const deleteGroundRentRateService = async (
    rate_id: string
) => {
    const rate = await db.GroundRentRate.findByPk(rate_id);

    if (!rate) {
        throw new Error("Ground rent rate not found");
    }

    await rate.destroy();

    return rate;
};