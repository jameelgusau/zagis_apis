import { Transaction } from "sequelize";
import { db } from "../db"; // Adjust to your Sequelize instance


// Converts a PostgreSQL DECIMAL string to integer kobo.
const toKobo = (value: string | number): bigint => {
    const amount = String(value);
    const negative = amount.startsWith("-");
    const normalized = negative ? amount.slice(1) : amount;
    const [whole, fraction = ""] = normalized.split(".");
    const kobo = BigInt(whole || "0") * 100n +
        BigInt(fraction.padEnd(2, "0").slice(0, 2) || "0");

    return negative ? -kobo : kobo;
};

const fromKobo = (value: bigint): string => {
    const negative = value < 0n;
    const absolute = negative ? -value : value;

    const result =
        `${absolute / 100n}.` +
        (absolute % 100n).toString().padStart(2, "0");

    return negative ? `-${result}` : result;
};

interface GetGroundRentBalanceOptions {
    fileId: string;
    billingYear: number;
    transaction?: Transaction;
}

export const getGroundRentBalance = async ({
    fileId,
    billingYear,
    transaction,
}: GetGroundRentBalanceOptions) => {
    const items = await db.GroundRentAssessmentItem.findAll({
        include: [
            {
                model: db.GroundRentAssessment,
                as: "assessment",
                where: { file_id: fileId },
                required: true,
                attributes: ["id", "file_id"],
            },
            {
                model: db.GroundRentPaymentAllocation,
                as: "paymentAllocations",
                required: false,
                attributes: ["id", "amount"],
            },
        ],
        order: [
            ["rent_year", "ASC"],
            ["payment_due_date", "ASC"],
        ],
        transaction,
    });

    let totalAssessedKobo = 0n;
    let totalAllocatedKobo = 0n;
    let totalOutstandingKobo = 0n;

    const rentYears = items.map((item) => {
        const assessedKobo = toKobo(item.amount);

        const allocatedKobo = (
            item.paymentAllocations ?? []
        ).reduce(
            (total, allocation) =>
                total + toKobo(allocation.amount),
            0n
        );

        // Prevent an overpayment from producing negative outstanding rent.
        const outstandingKobo =
            assessedKobo > allocatedKobo
                ? assessedKobo - allocatedKobo
                : 0n;

        totalAssessedKobo += assessedKobo;
        totalAllocatedKobo += allocatedKobo;
        totalOutstandingKobo += outstandingKobo;

        return {
            assessment_item_id: item.id,
            rent_year: item.rent_year,
            payment_due_date: item.payment_due_date,
            assessed_amount: fromKobo(assessedKobo),
            allocated_amount: fromKobo(allocatedKobo),
            outstanding_amount: fromKobo(outstandingKobo),
            is_paid: outstandingKobo === 0n,
        };
    });

    // Previous penalties are deliberately excluded.
    const currentPenalty = await db.GroundRentPenalty.findOne({
        where: {
            file_id: fileId,
            billing_year: billingYear,
        },
        transaction,
    });

    const currentPenaltyKobo = currentPenalty
        ? toKobo(currentPenalty.amount)
        : 0n;

    // Only the current billing year's penalty is included.
    const totalPayableKobo =
        totalOutstandingKobo + currentPenaltyKobo;

    return {
        file_id: fileId,
        billing_year: billingYear,

        total_assessed: fromKobo(totalAssessedKobo),
        total_allocated: fromKobo(totalAllocatedKobo),
        outstanding_ground_rent: fromKobo(totalOutstandingKobo),

        current_penalty: fromKobo(currentPenaltyKobo),
        total_payable: fromKobo(totalPayableKobo),

        ground_rent_cleared: totalOutstandingKobo === 0n,
        eligible_for_regrant: totalOutstandingKobo === 0n,

        rent_years: rentYears,
    };
};