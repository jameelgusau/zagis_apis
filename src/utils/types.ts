export interface GroundRentProperty {
  fileId: string;
  areaSqm: number;
  locationId: string;
  purposeId: string;
  commencementDate: string; // YYYY-MM-DD
}

export interface GroundRentRate {
  id: string;
  zoneId: string;
  purposeId: string;
  ratePerSqm: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface GroundRentPeriod {
  start: string;
  end: string;
  days: number;
  areaSqm: number;
  ratePerSqm: number;
  amount: number;
  rateId: string;
}

export interface GroundRentCalculation {
  fileId: string;
  calculationDate: string;
  total: number;
  periods: GroundRentPeriod[];
}

export interface CalculateGroundRentInput {
  property: GroundRentProperty;
  calculationDate: string;
  rates: GroundRentRate[];
}

export interface CreateGroundRentAssessmentInput {
    file_id: string;
    calculation_date?: Date;
}
