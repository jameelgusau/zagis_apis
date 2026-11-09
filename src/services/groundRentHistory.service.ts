
import { db } from "../db";

interface GetGroundRentHistoryInput {
  fileId: string;
}

export const getGroundRentHistory = async ({
  fileId,
}: GetGroundRentHistoryInput) => {
  const file = await db.File.findByPk(fileId, {
    attributes: ["id", "cofo_number", "title_holder_name"],
  });

  if (!file) {
    throw "Property file not found.";
  }

  const [payments, yearStatuses] = await Promise.all([
    db.GroundRentPayment.findAll({
      where: { file_id: fileId },
      include: [
        {
          model: db.GroundRentPaymentYear,
          as: "coveredYears",
          required: false,
        },
      ],
      order: [
        ["payment_date", "DESC"],
        ["created_at", "DESC"],
      ],
    }),

    db.GroundRentYearStatus.findAll({
      where: { file_id: fileId },
      order: [["rent_year", "DESC"]],
    }),
  ]);

  return {
    file: {
      id: file.id,
      cofo_number: file.cofo_number,
      title_holder_name: file.title_holder_name,
    },

    payments: payments.map((payment: any) => ({
      id: payment.id,
      payment_reference: payment.payment_reference,
      payment_date: payment.payment_date,
      amount: payment.amount,
      is_historical: payment.is_historical,
      receipt_date: payment.receipt_date,
      receipt_notes: payment.receipt_notes,

      covered_years: (payment.coveredYears ?? []).map((year: any) => ({
        rent_year: year.rent_year,
        amount: year.amount,
        verified: year.verified,
      })),
    })),

    year_statuses: yearStatuses.map((year: any) => ({
      rent_year: year.rent_year,
      status: year.status,
      notes: year.notes,
      verified_by: year.verified_by,
      verified_at: year.verified_at,
    })),
  };
};
