
import { Op, Transaction } from "sequelize";

import { db } from  "../db" // Adjust to your Sequelize instance
import { GroundRentPenalty } from "../models/GroundRentPenalty.model";
import { GroundRentPaymentAllocation } from "../models/ground_rent_payment_allocations.model";

const PENALTY_RATE = 5;

const toCents = (value: string): bigint => {
    const [whole, fraction = ""] = value.split(".");
    const cents = fraction.padEnd(2, "0").slice(0, 2);

    return BigInt(whole) * 100n + BigInt(cents);
};

const fromCents = (value: bigint): string => {
    const whole = value / 100n;
    const fraction = (value % 100n)
        .toString()
        .padStart(2, "0");

    return `${whole}.${fraction}`;
};

export const createAnnualGroundRentPenalty = async (
    fileId: string,
    billingYear: number
) => {
    return db.sequelize.transaction(
        async (transaction: Transaction) => {
            // Lock the file to prevent concurrent penalty creation.
            const file = await db.File.findByPk(fileId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!file) {
                throw "File not found."
            }

            // Never create a second penalty for the same file and year.
            const existingPenalty = await db.GroundRentPenalty.findOne({
                where: {
                    file_id: fileId,
                    billing_year: billingYear,
                },
                transaction,
            });

            if (existingPenalty) {
                return existingPenalty;
            }

            // The penalty is triggered on January 1.
            const penaltyDate = `${billingYear}-01-01`;

            // Get ground-rent items from earlier billing years.
            // Previous penalty records are never queried here.
            const items = await db.GroundRentAssessmentItem.findAll({
                where: {
                    payment_due_date: {
                        [Op.lt]: penaltyDate,
                    },
                },
                include: [
                    {
                        model: db.GroundRentAssessment,
                        as: "assessment",
                        where: {
                            file_id: fileId,
                        },
                        required: true,
                    },
                    {
                        model: db.GroundRentPaymentAllocation,
                        as: "paymentAllocations",
                        required: false,
                    },
                ],
                transaction,
            });

            let outstandingCents = 0n;

            for (const item of items) {
                const assessedCents = toCents(item.amount);

                const allocatedCents = (
                    item.paymentAllocations ?? []
                ).reduce(
                    (total, allocation) =>
                        total + toCents(allocation.amount),
                    0n
                );

                const itemOutstanding =
                    assessedCents > allocatedCents
                        ? assessedCents - allocatedCents
                        : 0n;

                outstandingCents += itemOutstanding;
            }

            // Nothing outstanding means no penalty.
            if (outstandingCents <= 0n) {
                return null;
            }

            // Round the 5% penalty to the nearest kobo.
            const penaltyCents =
                (outstandingCents * BigInt(PENALTY_RATE) + 50n) /
                100n;

            return GroundRentPenalty.create(
                {
                    file_id: fileId,
                    billing_year: billingYear,
                    penalty_rate: PENALTY_RATE.toFixed(4),
                    base_amount: fromCents(outstandingCents),
                    amount: fromCents(penaltyCents),
                    penalty_date: new Date(
                        `${penaltyDate}T00:00:00.000Z`
                    ),
                },
                { transaction }
            );
        }
    );
};