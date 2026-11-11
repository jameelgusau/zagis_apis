
import { db } from "../db";
import {
  generateGroundRentAssessment,
} from "./groundRentAssessmentGeneration.service";

interface BulkGenerateGroundRentAssessmentInput {
  rentYear: number;
  fileIds?: string[];
}

interface AssessmentResult {
  file_id: string;
  status: "GENERATED" | "SKIPPED" | "FAILED";
  message: string;
  amount?: string;
}

const isExpectedSkip = (message: string): boolean => {
  const expectedConditions = [
    "already exists",
    "no active grant",
    "rate not configured",
    "valid property area",
    "must have an LGA and purpose",
    "property file not found",
  ];

  return expectedConditions.some((condition) =>
    message.toLowerCase().includes(condition)
  );
};

export const bulkGenerateGroundRentAssessments = async ({
  rentYear,
  fileIds,
}: BulkGenerateGroundRentAssessmentInput) => {
  const currentYear = new Date().getFullYear();

  if (
    !Number.isInteger(rentYear) ||
    rentYear < 1900 ||
    rentYear > currentYear
  ) {
    throw `Rent year must be between 1900 and ${currentYear}.`
    ;
  }

  if (
    fileIds &&
    (!Array.isArray(fileIds) ||
      fileIds.length === 0 ||
      fileIds.some((id) => typeof id !== "string" || !id.trim()))
  ) {
    throw "fileIds must be a non-empty array of property file IDs when provided."
    
  }

  const uniqueFileIds = fileIds
    ? [...new Set(fileIds)]
    : null;

  const files = uniqueFileIds
    ? await db.File.findAll({
        attributes: ["id"],
        where: { id: uniqueFileIds },
        raw: true,
      })
    : await db.File.findAll({
        attributes: ["id"],
        raw: true,
      });

  const foundIds = new Set(files.map((file: any) => file.id));

  const results: AssessmentResult[] = [];

  // Report requested IDs that don't exist instead of silently ignoring them.
  if (uniqueFileIds) {
    for (const fileId of uniqueFileIds) {
      if (!foundIds.has(fileId)) {
        results.push({
          file_id: fileId,
          status: "SKIPPED",
          message: "Property file not found.",
        });
      }
    }
  }

  for (const file of files as Array<{ id: string }>) {
    try {
      const assessment = await generateGroundRentAssessment({
        fileId: file.id,
        rentYear,
      });

      results.push({
        file_id: file.id,
        status: "GENERATED",
        message: assessment.message,
        amount: assessment.amount,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      results.push({
        file_id: file.id,
        status: isExpectedSkip(message) ? "SKIPPED" : "FAILED",
        message,
      });
    }
  }

  const generated = results.filter(
    (result) => result.status === "GENERATED"
  ).length;

  const skipped = results.filter(
    (result) => result.status === "SKIPPED"
  ).length;

  const failed = results.filter(
    (result) => result.status === "FAILED"
  ).length;

  return {
    rent_year: rentYear,
    summary: {
      total: results.length,
      generated,
      skipped,
      failed,
    },
    results,
  };
};
