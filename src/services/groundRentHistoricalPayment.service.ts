
import { Transaction } from "sequelize";
import { db } from "../db";

interface HistoricalPaymentYearInput {
    rentYear: number;
    amount?: string | null;
}

interface RegisterHistoricalGroundRentPaymentInput {
    fileId: string;
    paymentReference: string;
    paymentDate: string;
    amount: string;
    receiptDate?: string | null;
    receiptNotes?: string | null;
    coveredYears: HistoricalPaymentYearInput[];
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

const validateDate = (value: string, field: string): void => {
    if (!DATE_REGEX.test(value)) {
        throw `${field} must use YYYY-MM-DD format.`
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        throw `${field} is not a valid date.`
    }
};

const toKobo = (value: string, field: string): bigint => {
    const normalized = value.trim();

    if (!AMOUNT_REGEX.test(normalized)) {
        throw `${field} must be a valid amount with no more than 2 decimal places.`
        
    }

    const [whole, fraction = ""] = normalized.split(".");
    const kobo =
        BigInt(whole) * 100n +
        BigInt(fraction.padEnd(2, "0"));

    if (kobo <= 0n) {
        throw `${field} must be greater than zero.`
    }

    return kobo;
};

const normalizeAmount = (value: string): string => {
    const [whole, fraction = ""] = value.trim().split(".");
    return `${whole}.${fraction.padEnd(2, "0")}`;
};

export const registerHistoricalGroundRentPayment = async (
    input: RegisterHistoricalGroundRentPaymentInput
) => {
    const fileId = input.fileId?.trim();
    const paymentReference = input.paymentReference?.trim();
    const paymentDate = input.paymentDate?.trim();
    const amount = input.amount?.trim();

    if (!fileId) {
        throw "Property file ID is required."
    }

    if (!paymentReference) {
        throw "Receipt/payment reference is required."
    }

    if (paymentReference.length > 100) {
        throw "Receipt/payment reference cannot exceed 100 characters."
        
    }

    if (!paymentDate) {
        throw "Payment date is required."
    }

    validateDate(paymentDate, "Payment date");

    if (input.receiptDate) {
        validateDate(input.receiptDate, "Receipt date");
    }

    const paymentAmountKobo = toKobo(amount, "Payment amount");

    if (
        !Array.isArray(input.coveredYears) ||
        input.coveredYears.length === 0
    ) {
        throw "At least one covered rent year must be provided."
    }

    const currentYear = new Date().getFullYear();
    const seenYears = new Set<number>();

    const coveredYears = input.coveredYears.map((entry) => {
        if (
            !Number.isInteger(entry.rentYear) ||
            entry.rentYear < 1900 ||
            entry.rentYear > currentYear
        ) {
            throw `Invalid rent year: ${entry.rentYear}.`
            
        }

        if (seenYears.has(entry.rentYear)) {
            throw `Rent year ${entry.rentYear} was supplied more than once.`
            
        }

        seenYears.add(entry.rentYear);

        let yearlyAmount: string | null = null;

        if (entry.amount !== undefined && entry.amount !== null) {
            yearlyAmount = normalizeAmount(entry.amount);

            toKobo(yearlyAmount, `Amount for ${entry.rentYear}`);
        }

        return {
            rent_year: entry.rentYear,
            amount: yearlyAmount,
        };
    });

    // Documented yearly amounts must not exceed the receipt total.
    const documentedTotalKobo = coveredYears.reduce(
        (total, year) =>
            total +
            (year.amount === null
                ? 0n
                : toKobo(year.amount, `Amount for ${year.rent_year}`)),
        0n
    );

    if (documentedTotalKobo > paymentAmountKobo) {
        throw "The sum of the documented yearly amounts cannot exceed the receipt total."
    }

    return db.sequelize.transaction(
        async (transaction: Transaction) => {
            // Lock the property row while registering this receipt.
            const file = await db.File.findByPk(fileId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!file) {
                throw "Property file was not found."
            }

            // Receipt references must be unique across payments.
            const existingPayment =
                await db.GroundRentPayment.findOne({
                    where: {
                        payment_reference: paymentReference,
                    },
                    transaction,
                });

            if (existingPayment) {
                throw "This payment/receipt reference has already been registered."
                
            }

            const payment = await db.GroundRentPayment.create(
                {
                    file_id: fileId,
                    payment_reference: paymentReference,
                    payment_date: new Date(`${paymentDate}T00:00:00.000Z`),
                    amount: normalizeAmount(amount),
                    is_historical: true,
                    receipt_date: input.receiptDate
                        ? new Date(`${input.receiptDate}T00:00:00.000Z`)
                        : null,
                    receipt_notes: input.receiptNotes?.trim() || null,
                },
                { transaction }
            );

            await db.GroundRentPaymentYear.bulkCreate(
                coveredYears.map((year) => ({
                    payment_id: payment.id,
                    rent_year: year.rent_year,
                    amount: year.amount,
                    verified: false,
                })),
                { transaction }
            );

            // Create missing status rows, but never overwrite an
            // existing PAID, UNPAID, or UNVERIFIED status.
            for (const year of coveredYears) {
                await db.GroundRentYearStatus.findOrCreate({
                    where: {
                        file_id: fileId,
                        rent_year: year.rent_year,
                    },
                    defaults: {
                        file_id: fileId,
                        rent_year: year.rent_year,
                        status: "UNVERIFIED",
                        notes: null,
                        verified_by: null,
                        verified_at: null,
                    },
                    transaction,
                });
            }

            return {
                message:
                    "Historical payment and covered rent years registered. Verification is still required.",
                payment,
                covered_years: coveredYears.map(
                    (year) => year.rent_year
                ),
                documented_yearly_total:
                    (Number(documentedTotalKobo) / 100).toFixed(2),
                receipt_total: normalizeAmount(amount),
                verification_required: true,
            };
        }
    );
};
