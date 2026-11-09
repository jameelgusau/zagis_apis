
import { Transaction } from "sequelize";
import { db } from "../db";

export type GroundRentVerificationStatus = "PAID" | "UNPAID";

export interface VerifyGroundRentYearInput {
  fileId: string;
  rentYear: number;
  status: GroundRentVerificationStatus;
  verifiedBy: string;
  notes?: string | null;
  paymentId?: string;
}

export const verifyGroundRentYearServices = async (
  input: VerifyGroundRentYearInput
) => {
  const {
    fileId,
    rentYear,
    status,
    verifiedBy,
    notes,
    paymentId,
  } = input;

  const currentYear = new Date().getFullYear();

  if (!fileId) {
    throw "File ID is required."
  }

  if (!verifiedBy) {
    throw "The verifying user's ID is required."
  }

  if (
    !Number.isInteger(rentYear) ||
    rentYear < 1900 ||
    rentYear > currentYear
  ) {
    throw `Rent year must be between 1900 and ${currentYear}.`
  }

  if (status !== "PAID" && status !== "UNPAID") {
    throw "Status must be PAID or UNPAID."
  }

  if (status === "PAID" && !paymentId) {
    throw "A historical payment receipt must be selected to verify a year as PAID."
  }

  return db.sequelize.transaction(
    async (transaction: Transaction) => {
      // Lock the property row to serialize verification for this file.
      const file = await db.File.findByPk(fileId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!file) {
        throw "Property file not found."
      }

      // Lock the existing status row, if present.
      let yearStatus = await db.GroundRentYearStatus.findOne({
        where: {
          file_id: fileId,
          rent_year: rentYear,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!yearStatus) {
        yearStatus = await db.GroundRentYearStatus.create(
          {
            file_id: fileId,
            rent_year: rentYear,
            status: "UNVERIFIED",
            notes: null,
            verified_by: null,
            verified_at: null,
          },
          { transaction }
        );
      }

      // Do not silently overwrite a previous verification.
      if (
        yearStatus.status !== "UNVERIFIED" ||
        yearStatus.verified_at
      ) {
        throw `Rent year ${rentYear} is already verified as ${yearStatus.status}. ` +
            "Use a separate, authorized correction process to change it."
        
      }

      let verifiedPaymentYear: any = null;

      if (status === "PAID") {
        // The selected receipt must be historical, belong to this file,
        // and explicitly list the year being verified.
        verifiedPaymentYear =
          await db.GroundRentPaymentYear.findOne({
            where: {
              payment_id: paymentId,
              rent_year: rentYear,
            },
            include: [
              {
                model: db.GroundRentPayment,
                as: "payment",
                required: true,
                where: {
                  file_id: fileId,
                  is_historical: true,
                },
              },
            ],
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

        if (!verifiedPaymentYear) {
          throw "The selected historical receipt does not belong to this property " +
              `or does not cover rent year ${rentYear}.`
          
        }

        if (verifiedPaymentYear.verified) {
          throw "This receipt-year record has already been verified."
        
        }

        await verifiedPaymentYear.update(
          { verified: true },
          { transaction }
        );
      }

      await yearStatus.update(
        {
          status,
          notes: notes?.trim() || null,
          verified_by: verifiedBy,
          verified_at: new Date(),
        },
        { transaction }
      );

      return {
        file_id: fileId,
        rent_year: rentYear,
        status,
        verified_by: verifiedBy,
        verified_at: yearStatus.verified_at,
        payment_id: status === "PAID" ? paymentId : null,
        message:
          status === "PAID"
            ? `Rent year ${rentYear} verified as PAID.`
            : `Rent year ${rentYear} verified as UNPAID.`,
      };
    }
  );
};
