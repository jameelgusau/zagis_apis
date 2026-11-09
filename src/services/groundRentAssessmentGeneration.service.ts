
import { Op, Transaction } from "sequelize";
import { db } from "../db";

interface GenerateGroundRentAssessmentInput {
  fileId: string;
  rentYear: number;
}

export const generateGroundRentAssessment = async ({
  fileId,
  rentYear,
}: GenerateGroundRentAssessmentInput) => {
  const currentYear = new Date().getFullYear();

  if (!fileId) {
    throw "File ID is required."
  }

  if (
    !Number.isInteger(rentYear) ||
    rentYear < 1900 ||
    rentYear > currentYear
  ) {
    throw `Rent year must be between 1900 and ${currentYear}.`
  }

  return db.sequelize.transaction(
    async (transaction: Transaction) => {
      const file = await db.File.findByPk(fileId, {
        include: [
          { model: db.FileGrant, as: "grants" },
          { model: db.FilePurposeHistory, as: "purposeHistory" },
          { model: db.FileAreaHistory, as: "areaHistory" },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!file) {
        throw "Property file not found."
      }

      const yearStart = new Date(Date.UTC(rentYear, 0, 1));
      const yearEnd = new Date(Date.UTC(rentYear, 11, 31));

      // A grant must be active on 1 January of the rent year.
      const grant = (file.grants ?? [])
        .filter((item: any) => {
          const commencement = new Date(item.commencement_date);
          const expiry = item.expiry_date
            ? new Date(item.expiry_date)
            : null;

          return (
            commencement <= yearStart &&
            (!expiry || expiry >= yearStart)
          );
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.commencement_date).getTime() -
            new Date(a.commencement_date).getTime()
        )[0];

      if (!grant) {
        throw `No active grant exists for rent year ${rentYear}.`
    
      }

      // Resolve the latest area history applicable on 31 December.
      const areaHistory = await db.FileAreaHistory.findOne({
        where: {
          file_id: fileId,
          effective_from: { [Op.lte]: yearEnd },
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: yearEnd } },
          ],
        },
        order: [["effective_from", "DESC"]],
        transaction,
      });

      // Resolve the latest purpose history applicable on 31 December.
      const purposeHistory = await db.FilePurposeHistory.findOne({
        where: {
          file_id: fileId,
          effective_from: { [Op.lte]: yearEnd },
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: yearEnd } },
          ],
        },
        order: [["effective_from", "DESC"]],
        transaction,
      });

      const areaSqm = Number(
        areaHistory?.area_sqm ?? file.area_sqm
      );

      const purposeId =
        purposeHistory?.purpose_id ?? file.purpose_id;

      const lgaId = file.lga_id;

      if (!Number.isFinite(areaSqm) || areaSqm <= 0) {
        throw "A valid property area is required."
      }

      if (!lgaId || !purposeId) {
        throw "The property must have an LGA and purpose configured."
    
      }

      // The applicable annual rate must be active on 1 January.
      const rate = await db.GroundRentRate.findOne({
        where: {
          lga_id: lgaId,
          purpose_id: purposeId,
          effective_from: { [Op.lte]: yearStart },
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: yearStart } },
          ],
        },
        order: [["effective_from", "DESC"]],
        transaction,
      });

      if (!rate) {
        throw `Ground-rent rate not configured for LGA, purpose, and rent year ${rentYear}.`
        
      }

      // Do not generate a duplicate item for the same property and year.
      const existingItem =
        await db.GroundRentAssessmentItem.findOne({
          where: { rent_year: rentYear },
          include: [
            {
              model: db.GroundRentAssessment,
              required: true,
              where: { file_id: fileId },
            },
          ],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      if (existingItem) {
        throw `An assessment already exists for rent year ${rentYear}.`
        
      }

      const ratePerSqm = Number(rate.rate_per_sqm);

      if (!Number.isFinite(ratePerSqm) || ratePerSqm < 0) {
        throw "The configured ground-rent rate is invalid."
      }

      // Round the annual charge to two decimal places.
      const amount = (areaSqm * ratePerSqm).toFixed(2);

      const assessment = await db.GroundRentAssessment.create(
        {
          file_id: fileId,
          calculation_date: new Date(),
          commencement_date: grant.commencement_date,
          area_sqm: areaSqm.toString(),
          total_amount: amount,
        },
        { transaction }
      );

      await db.GroundRentAssessmentItem.create(
        {
          assessment_id: assessment.id,
          rate_id: rate.id,
          rent_year: rentYear,
          payment_due_date: yearStart,
          period_start: yearStart,
          period_end: yearEnd,
          area_sqm: areaSqm.toString(),
          rate_per_sqm: ratePerSqm.toString(),
          amount,
        },
        { transaction }
      );

      // Keep existing payment verification decisions unchanged.
      const [yearStatus] =
        await db.GroundRentYearStatus.findOrCreate({
          where: {
            file_id: fileId,
            rent_year: rentYear,
          },
          defaults: {
            file_id: fileId,
            rent_year: rentYear,
            status: "UNVERIFIED",
            notes: null,
            verified_by: null,
            verified_at: null,
          },
          transaction,
        });

      return {
        file_id: fileId,
        assessment_id: assessment.id,
        rent_year: rentYear,
        payment_due_date: yearStart,
        area_sqm: areaSqm,
        purpose_id: purposeId,
        lga_id: lgaId,
        rate_per_sqm: ratePerSqm,
        amount,
        status: yearStatus.status,
        message: `Ground-rent assessment generated for ${rentYear}.`,
      };
    }
  );
};
