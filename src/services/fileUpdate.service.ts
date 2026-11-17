import { Op } from "sequelize";
import { db } from "../db";

export interface BasicFileUpdateParams {
    file_id: string;
    updated_by: string;
    cofo_number?: string;
    title_holder_name?: string;
    location?: string | null;
    lga_id?: string;
    effective_from?: string;
}


interface UpdatePurposeParams {
    file_id: string;
    landuse_id: string;
    purpose_id: string;
    updated_by: string;
    effective_from: string; // ISO date string (YYYY-MM-DD)
}


export interface UpdateAreaParams {
    file_id: string;
    area_sqm: number;
    effective_from: string;
    updated_by: string;
}

const getToday = (): string => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const getPreviousDay = (date: string): string => {
    const previous = new Date(`${date}T00:00:00.000Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return previous.toISOString().slice(0, 10);
};

const isValidDate = (date: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
};


export const updateBasicFileService = async (
    params: BasicFileUpdateParams
) => {
    const transaction = await db.sequelize.transaction();

    try {
        const {
            file_id,
            updated_by,
            cofo_number,
            title_holder_name,
            location,
            lga_id,
        } = params;

        // 1. Retrieve and lock the property
        const file = await db.File.findByPk(file_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!file) {
            throw "Property not found"
        }

        const updates: Record<string, unknown> = {
            updated_by,
        };

        // 2. Update COFO number
        if (cofo_number !== undefined) {
            const normalizedCofo = cofo_number.trim().toUpperCase();

            const existingFile = await db.File.findOne({
                where: {
                    cofo_number: {
                        [Op.iLike]: normalizedCofo,
                    },
                    id: {
                        [Op.ne]: file_id,
                    },
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (existingFile) {
                throw `COFO number ${normalizedCofo} already belongs to another property`
                ;
            }

            updates.cofo_number = normalizedCofo;
        }

        // 3. Update title holder and preserve history

        if (title_holder_name !== undefined) {
            const normalizedName = title_holder_name.trim().toUpperCase();

            if (!normalizedName) {
                throw "Title holder name cannot be empty";
            }

            const effectiveDate = params.effective_from || getToday();

            if (!isValidDate(effectiveDate)) {
                throw "Invalid effective_from date. Use YYYY-MM-DD.";
            }

            const originalGrant = await db.FileGrant.findOne({
                where: { file_id, grant_type: "ORIGINAL" },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!originalGrant) {
                throw "Original grant not found";
            }

            if (effectiveDate < originalGrant.commencement_date) {
                throw "Effective date cannot be earlier than the original grant commencement date"
                ;
            }

            const histories = await db.FileNameHistory.findAll({
                where: { file_id },
                order: [["effective_from", "ASC"]],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const sameDateHistory = histories.find(
                (history) => history.effective_from === effectiveDate
            );

            if (sameDateHistory) {
                await sameDateHistory.update(
                    { title_holder_name: normalizedName },
                    { transaction }
                );
            } else {
                const previousHistory = histories
                    .filter((history) => history.effective_from < effectiveDate)
                    .at(-1);

                const nextHistory = histories.find(
                    (history) => history.effective_from > effectiveDate
                );

                if (previousHistory) {
                    await previousHistory.update(
                        { effective_to: getPreviousDay(effectiveDate) },
                        { transaction }
                    );
                }

                await db.FileNameHistory.create(
                    {
                        file_id,
                        title_holder_name: normalizedName,
                        effective_from: effectiveDate,
                        effective_to: nextHistory
                            ? getPreviousDay(nextHistory.effective_from)
                            : null,
                    },
                    { transaction }
                );
            }

            // Find the title holder currently effective today
            const currentHistory = await db.FileNameHistory.findOne({
                where: {
                    file_id,
                    effective_from: { [Op.lte]: getToday() },
                },
                order: [["effective_from", "DESC"]],
                transaction,
            });

            if (currentHistory) {
                updates.title_holder_name = currentHistory.title_holder_name;
            }
        }

        // 4. Update location
        if (location !== undefined) {
            updates.location = location?.trim() || null;
        }

        // 5. Update LGA
        if (lga_id !== undefined) {
            updates.lga_id = lga_id;
        }

        // 6. Save property changes
        await file.update(updates, { transaction });

        await transaction.commit();

        return file;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export const updateFilePurposeService = async (
    params: UpdatePurposeParams
) => {
    const transaction = await db.sequelize.transaction();

    try {
        const {
            file_id,
            landuse_id,
            purpose_id,
            effective_from,
            updated_by,
        } = params;

        if (!isValidDate(effective_from)) {
            throw "Invalid effective_from date. Use YYYY-MM-DD.";
        }

        const effectiveDate = effective_from;

        // 1. Lock property
        const file = await db.File.findByPk(file_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!file) {
            throw "Property not found";
        }

        // 2. Validate land use
        const landuse = await db.Landuse.findByPk(landuse_id, {
            transaction,
        });

        if (!landuse) {
            throw "Land use not found";
        }

        // 3. Validate purpose belongs to land use
        const purpose = await db.Purpose.findOne({
            where: {
                id: purpose_id,
                landuse_id,
            },
            transaction,
        });

        if (!purpose) {
            throw "Purpose not found or does not belong to the selected land use"
            ;
        }

        // 4. Get all purpose history records
        const histories = await db.FilePurposeHistory.findAll({
            where: { file_id },
            order: [["effective_from", "ASC"]],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        // 5. Check whether the date falls within an existing period
        const nextHistory = histories.find(
            (history) => history.effective_from > effectiveDate
        );

        const previousHistory = histories
            .filter((history) => history.effective_from < effectiveDate)
            .at(-1);

        if (
            previousHistory?.effective_to &&
            previousHistory.effective_to < effectiveDate
        ) {
            throw "Effective date falls outside the existing purpose history period"
            
        }


        // 6. Prevent duplicate effective dates

        const sameDateHistory = histories.find(
            (history) => history.effective_from === effectiveDate
        );
        if (sameDateHistory) {
            await sameDateHistory.update(
                { purpose_id },
                { transaction }
            );
        } else {
            // Close the previous period
            if (previousHistory) {
                await previousHistory.update(
                    { effective_to: getPreviousDay(effectiveDate) },
                    { transaction }
                );
            }


            // Create the new history period
            await db.FilePurposeHistory.create(
                {
                    file_id,
                    purpose_id,
                    effective_from: effectiveDate,
                    effective_to: nextHistory
                        ? getPreviousDay(nextHistory.effective_from)
                        : null,
                },
                { transaction }
            );
        }

        // 7. Update current property only when this is the latest change

        const today = getToday();

        const latestHistory = await db.FilePurposeHistory.findOne({
            where: {
                file_id,
                effective_from: { [Op.lte]: today },
            },
            order: [["effective_from", "DESC"]],
            transaction,
        });

        if (latestHistory) {
            const currentPurpose = await db.Purpose.findByPk(
                latestHistory.purpose_id,
                { transaction }
            );

            if (!currentPurpose) {
                throw "Current purpose not found";
            }

            await file.update(
                {
                    landuse_id: currentPurpose.landuse_id,
                    purpose_id: latestHistory.purpose_id,
                    updated_by,
                },
                { transaction }
            );
        }

        await transaction.commit();

        return file;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export const updateFileAreaService = async (
    params: UpdateAreaParams
) => {
    const transaction = await db.sequelize.transaction();

    try {
        const {
            file_id,
            area_sqm,
            effective_from,
            updated_by,
        } = params;

        // 1. Validate area
        if (!Number.isFinite(area_sqm) || area_sqm <= 0) {
            throw "Area must be greater than zero";
        }

        // 2. Validate effective date
        if (!isValidDate(effective_from)) {
            throw "Invalid effective date. Use YYYY-MM-DD.";
        }

        // 3. Retrieve and lock property
        const file = await db.File.findByPk(file_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!file) {
            throw "Property not found";
        }

        // 4. Validate original grant commencement date
        const originalGrant = await db.FileGrant.findOne({
            where: {
                file_id,
                grant_type: "ORIGINAL",
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!originalGrant) {
            throw "Original grant not found";
        }

        if (effective_from < originalGrant.commencement_date) {
            throw "Effective date cannot be earlier than the original grant commencement date"
            ;
        }

        // 5. Retrieve existing area history
        const histories = await db.FileAreaHistory.findAll({
            where: { file_id },
            order: [["effective_from", "ASC"]],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        // 6. Check for an existing effective date
        const sameDateHistory = histories.find(
            (history) => history.effective_from === effective_from
        );

        if (sameDateHistory) {
            await sameDateHistory.update(
                { area_sqm: String(area_sqm) },
                { transaction }
            );
        } else {
            const previousHistory = histories
                .filter(
                    (history) => history.effective_from < effective_from
                )
                .at(-1);

            const nextHistory = histories.find(
                (history) => history.effective_from > effective_from
            );

            // Close previous area period
            if (previousHistory) {
                await previousHistory.update(
                    { effective_to: getPreviousDay(effective_from) },
                    { transaction }
                );
            }

            // Create new area history
            await db.FileAreaHistory.create(
                {
                    file_id,
                    area_sqm: String(area_sqm),
                    effective_from,
                    effective_to: nextHistory
                        ? getPreviousDay(nextHistory.effective_from)
                        : null,
                },
                { transaction }
            );
        }

        // 7. Update current property area
        const currentHistory = await db.FileAreaHistory.findOne({
            where: {
                file_id,
                effective_from: {
                    [Op.lte]: getToday(),
                },
            },
            order: [["effective_from", "DESC"]],
            transaction,
        });

        if (currentHistory) {
            await file.update(
                {
                    area_sqm: Number(currentHistory.area_sqm),
                    updated_by,
                },
                { transaction }
            );
        }

        await transaction.commit();

        return file;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};