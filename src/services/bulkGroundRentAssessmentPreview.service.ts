
import { Op } from "sequelize";
import { db } from "../db";

interface BulkGroundRentAssessmentPreviewInput {
  rentYear: number;
  fileIds?: string[];
}

interface PreviewResult {
  file_id: string;
  cofo_number?: string | null;
  title_holder_name?: string | null;
  status:
    | "ELIGIBLE"
    | "ALREADY_GENERATED"
    | "NEEDS_ATTENTION"
    | "ERROR";
  area_sqm?: number;
  purpose_id?: string | null;
  lga_id?: string | null;
  rate_per_sqm?: number;
  estimated_amount?: string;
  reasons: string[];
}

export const previewBulkGroundRentAssessments = async ({
  rentYear,
  fileIds,
}: BulkGroundRentAssessmentPreviewInput) => {
  const currentYear = new Date().getFullYear();

  if (
    !Number.isInteger(rentYear) ||
    rentYear < 1900 ||
    rentYear > currentYear
  ) {
    throw new Error(
      `Rent year must be between 1900 and ${currentYear}.`
    );
  }

  if (
    fileIds &&
    (!Array.isArray(fileIds) ||
      fileIds.length === 0 ||
      fileIds.some((id) => typeof id !== "string" || !id.trim()))
  ) {
    throw new Error("fileIds must be a non-empty array when provided.");
  }

  const uniqueFileIds = fileIds
    ? [...new Set(fileIds)]
    : undefined;

  const files = await db.File.findAll({
    attributes: ["id", "cofo_number", "title_holder_name"],
    ...(uniqueFileIds
      ? { where: { id: { [Op.in]: uniqueFileIds } } }
      : {}),
    order: [["created_at", "ASC"]],
  });

  const foundIds = new Set(
    files.map((file: any) => file.id)
  );

  const results: PreviewResult[] = [];

  // Include requested property IDs that do not exist.
  if (uniqueFileIds) {
    for (const fileId of uniqueFileIds) {
      if (!foundIds.has(fileId)) {
        results.push({
          file_id: fileId,
          status: "NEEDS_ATTENTION",
          reasons: ["Property file not found."],
        });
      }
    }
  }

  const yearStart = new Date(Date.UTC(rentYear, 0, 1));
  const yearEnd = new Date(Date.UTC(rentYear, 11, 31));

  for (const fileRecord of files as any[]) {
    const result: PreviewResult = {
      file_id: fileRecord.id,
      cofo_number: fileRecord.cofo_number,
      title_holder_name: fileRecord.title_holder_name,
      status: "ELIGIBLE",
      reasons: [],
    };

    try {
      const file = await db.File.findByPk(fileRecord.id, {
        include: [
          { model: db.FileGrant, as: "grants" },
          { model: db.FilePurposeHistory, as: "purposeHistory" },
          { model: db.FileAreaHistory, as: "areaHistory" },
        ],
      });

      if (!file) {
        result.status = "NEEDS_ATTENTION";
        result.reasons.push("Property file not found.");
        results.push(result);
        continue;
      }

      // Check for an existing assessment.
      const existingItem =
        await db.GroundRentAssessmentItem.findOne({
          where: { rent_year: rentYear },
          include: [
            {
              model: db.GroundRentAssessment,
              required: true,
              where: { file_id: fileRecord.id },
            },
          ],
        });

      if (existingItem) {
        result.status = "ALREADY_GENERATED";
        result.reasons.push(
          `An assessment already exists for ${rentYear}.`
        );
        results.push(result);
        continue;
      }

      // Find a grant active on 1 January.
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
        result.reasons.push(
          `No active grant exists on 1 January ${rentYear}.`
        );
      }

      // Resolve area applicable on 31 December.
      const areaHistory = await db.FileAreaHistory.findOne({
        where: {
          file_id: fileRecord.id,
          effective_from: { [Op.lte]: yearEnd },
          [Op.or]: [
            { effective_to: null },
            { effective_to: { [Op.gte]: yearEnd } },
          ],
        },
        order: [["effective_from", "DESC"]],
      });

      const areaSqm = Number(
        areaHistory?.area_sqm ?? file.area_sqm
      );

      result.area_sqm = areaSqm;

      if (!Number.isFinite(areaSqm) || areaSqm <= 0) {
        result.reasons.push("Valid property area is missing.");
      }

      // Resolve purpose applicable on 31 December.
      const purposeHistory =
        await db.FilePurposeHistory.findOne({
          where: {
            file_id: fileRecord.id,
            effective_from: { [Op.lte]: yearEnd },
            [Op.or]: [
              { effective_to: null },
              { effective_to: { [Op.gte]: yearEnd } },
            ],
          },
          order: [["effective_from", "DESC"]],
        });

      const purposeId =
        purposeHistory?.purpose_id ?? file.purpose_id;

      const lgaId = file.lga_id;

      result.purpose_id = purposeId;
      result.lga_id = lgaId;

      if (!purposeId) {
        result.reasons.push("Property purpose is missing.");
      }

      if (!lgaId) {
        result.reasons.push("Property LGA is missing.");
      }

      // Find the rate active on 1 January.
      let rate: any = null;

      if (purposeId && lgaId) {
        rate = await db.GroundRentRate.findOne({
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
        });
      }

      if (!rate) {
        result.reasons.push(
          `Ground-rent rate is not configured for ${rentYear}.`
        );
      } else {
        const ratePerSqm = Number(rate.rate_per_sqm);

        result.rate_per_sqm = ratePerSqm;

        if (
          !Number.isFinite(ratePerSqm) ||
          ratePerSqm < 0
        ) {
          result.reasons.push(
            "Configured ground-rent rate is invalid."
          );
        } else if (
          Number.isFinite(areaSqm) &&
          areaSqm > 0
        ) {
          result.estimated_amount = (
            areaSqm * ratePerSqm
          ).toFixed(2);
        }
      }

      if (result.reasons.length > 0) {
        result.status = "NEEDS_ATTENTION";
      }
    } catch (error) {
      result.status = "ERROR";
      result.reasons = [
        error instanceof Error
          ? error.message
          : "Unexpected error while checking property.",
      ];
    }

    results.push(result);
  }

  const eligible = results.filter(
    (item) => item.status === "ELIGIBLE"
  ).length;

  const alreadyGenerated = results.filter(
    (item) => item.status === "ALREADY_GENERATED"
  ).length;

  const needsAttention = results.filter(
    (item) => item.status === "NEEDS_ATTENTION"
  ).length;

  const errors = results.filter(
    (item) => item.status === "ERROR"
  ).length;

  const estimatedTotal = results
    .filter((item) => item.status === "ELIGIBLE")
    .reduce(
      (total, item) =>
        total + Number(item.estimated_amount ?? 0),
      0
    );

  return {
    rent_year: rentYear,
    summary: {
      total_properties: results.length,
      eligible: eligible,
      already_generated: alreadyGenerated,
      needs_attention: needsAttention,
      errors,
      estimated_total: estimatedTotal.toFixed(2),
    },
    results,
  };
};
