
import { Op, Transaction } from "sequelize";
import { db } from "../db";

interface RecordGroundRentPaymentInput {
    fileId: string;
    paymentReference: string;
    paymentDate: string;
    amount: string;
}

// Convert a valid monetary amount to integer kobo.
const toKobo = (value: string | number): bigint => {
    const amount = String(value).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
        throw "Amount must be a positive number with no more than two decimal places."
        
    }

    const [whole, fraction = ""] = amount.split(".");

    return (
        BigInt(whole) * 100n +
        BigInt(fraction.padEnd(2, "0"))
    );
};

const fromKobo = (value: bigint): string => {
    const whole = value / 100n;
    const fraction = (value % 100n).toString().padStart(2, "0");

    return `${whole}.${fraction}`;
};

const isValidDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

export const recordGroundRentPayment = async (
    input: RecordGroundRentPaymentInput
) => {
    const paymentAmount = toKobo(input.amount);

    if (paymentAmount <= 0n) {
        throw "Payment amount must be greater than zero.";
    }

    if (!isValidDate(input.paymentDate)) {
        throw "Payment date must be a valid date in YYYY-MM-DD format."
        
    }

    const paymentReference = input.paymentReference.trim();

    if (!paymentReference) {
        throw "Payment reference is required.";
    }

    return db.sequelize.transaction(
        async (transaction: Transaction) => {
            // Serialize payment and credit operations for this file.
            const file = await db.File.findByPk(input.fileId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!file) {
                throw "File not found.";
            }

            // Reject duplicate references with a clear error.
            const existingPayment =
                await db.GroundRentPayment.findOne({
                    where: {
                        payment_reference: paymentReference,
                    },
                    transaction,
                });

            if (existingPayment) {
                throw "A payment with this reference already exists."
                
            }

            // Only allocate against rent already due on the payment date.
            const items =
                await db.GroundRentAssessmentItem.findAll({
                    where: {
                        payment_due_date: {
                            [Op.lte]: input.paymentDate,
                        },
                    },
                    include: [
                        {
                            model: db.GroundRentAssessment,
                            as: "assessment",
                            where: {
                                file_id: input.fileId,
                            },
                            required: true,
                            attributes: ["id", "file_id"],
                        },
                        {
                            model: db.GroundRentPaymentAllocation,
                            as: "paymentAllocations",
                            required: false,
                        },
                    ],
                    order: [
                        ["payment_due_date", "ASC"],
                        ["rent_year", "ASC"],
                        ["created_at", "ASC"],
                    ],
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

            const outstanding = items.map((item) => {
                const assessed = toKobo(item.amount);

                const allocated = (
                    item.paymentAllocations ?? []
                ).reduce(
                    (sum, allocation) =>
                        sum + toKobo(allocation.amount),
                    0n
                );

                if (allocated > assessed) {
                    throw `Existing allocations exceed the assessed amount for rent year ${item.rent_year}.`
                    
                }

                return {
                    item,
                    remaining: assessed - allocated,
                };
            });

            // Apply available credits to the oldest rent due.
            const credits = await db.GroundRentCredit.findAll({
                where: {
                    file_id: input.fileId,
                    remaining_amount: {
                        [Op.gt]: "0",
                    },
                },
                order: [
                    ["created_at", "ASC"],
                    ["id", "ASC"],
                ],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            for (const credit of credits) {
                let creditRemaining = toKobo(
                    credit.remaining_amount
                );

                for (const entry of outstanding) {
                    if (creditRemaining <= 0n) break;
                    if (entry.remaining <= 0n) continue;

                    const applied =
                        creditRemaining < entry.remaining
                            ? creditRemaining
                            : entry.remaining;

                    await db.GroundRentPaymentAllocation.create(
                        {
                            payment_id: credit.payment_id,
                            assessment_item_id: entry.item.id,
                            amount: fromKobo(applied),
                        },
                        { transaction }
                    );

                    entry.remaining -= applied;
                    creditRemaining -= applied;
                }

                await credit.update(
                    {
                        remaining_amount:
                            fromKobo(creditRemaining),
                    },
                    { transaction }
                );
            }

            // Record the new payment.
            const payment = await db.GroundRentPayment.create(
                {
                    file_id: input.fileId,
                    payment_reference: paymentReference,
                    payment_date: new Date(
                        `${input.paymentDate}T00:00:00.000Z`
                    ),
                    amount: fromKobo(paymentAmount),
                },
                { transaction }
            );

            let paymentRemaining = paymentAmount;

            // Allocate the new payment to the oldest outstanding rent.
            for (const entry of outstanding) {
                if (paymentRemaining <= 0n) break;
                if (entry.remaining <= 0n) continue;

                const allocated =
                    paymentRemaining < entry.remaining
                        ? paymentRemaining
                        : entry.remaining;

                await db.GroundRentPaymentAllocation.create(
                    {
                        payment_id: payment.id,
                        assessment_item_id: entry.item.id,
                        amount: fromKobo(allocated),
                    },
                    { transaction }
                );

                entry.remaining -= allocated;
                paymentRemaining -= allocated;
            }

            // Keep any excess as a credit for future ground rent.
            if (paymentRemaining > 0n) {
                await db.GroundRentCredit.create(
                    {
                        file_id: input.fileId,
                        payment_id: payment.id,
                        original_amount:
                            fromKobo(paymentRemaining),
                        remaining_amount:
                            fromKobo(paymentRemaining),
                    },
                    { transaction }
                );
            }

            return {
                payment,
                amount_received: fromKobo(paymentAmount),
                amount_allocated: fromKobo(
                    paymentAmount - paymentRemaining
                ),
                credit_created: fromKobo(paymentRemaining),
            };
        }
    );
};