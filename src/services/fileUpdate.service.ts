
import { Op } from "sequelize";
import { db } from "../db";

export interface BasicFileUpdateParams {
    file_id: string;
    updated_by: string;
    cofo_number?: string;
    title_holder_name?: string;
    location?: string | null;
    lga_id?: string;
}

const getToday = (): Date => {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
};

const getPreviousDay = (date: Date): Date => {
  const previous = new Date(date);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return previous;
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
            throw new Error("Property not found");
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
                throw new Error(
                    `COFO number ${normalizedCofo} already belongs to another property`
                );
            }

            updates.cofo_number = normalizedCofo;
        }

        // 3. Update title holder and preserve history
        if (title_holder_name !== undefined) {
            const normalizedName = title_holder_name.trim().toUpperCase();

            if (normalizedName !== file.title_holder_name) {
                const effectiveDate = new Date(`${getToday()}T00:00:00.000Z`);

                const activeHistory = await db.FileNameHistory.findOne({
                    where: {
                        file_id,
                        effective_to: null,
                    },
                    order: [["effective_from", "DESC"]],
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (activeHistory) {
                    const historyStart = new Date(
                        `${activeHistory.effective_from}T00:00:00.000Z`
                    );

                    const updateDate = new Date(
                        `${effectiveDate}T00:00:00.000Z`
                    );

                    if (historyStart >= updateDate) {
                        // Same-day change: update the active history entry
                        await activeHistory.update(
                            { title_holder_name: normalizedName },
                            { transaction }
                        );
                    } else {
                        // Close the previous history entry
                        await activeHistory.update(
                            {
                                effective_to: getPreviousDay(effectiveDate),
                            },
                            { transaction }
                        );

                        // Create new history entry
                        await db.FileNameHistory.create(
                            {
                                file_id,
                                title_holder_name: normalizedName,
                                effective_from: effectiveDate,
                                effective_to: null,
                            },
                            { transaction }
                        );
                    }
                } else {
                    // Create history if no active history exists
                    await db.FileNameHistory.create(
                        {
                            file_id,
                            title_holder_name: normalizedName,
                            effective_from: effectiveDate,
                            effective_to: null,
                        },
                        { transaction }
                    );
                }
            }

            updates.title_holder_name = normalizedName;
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
