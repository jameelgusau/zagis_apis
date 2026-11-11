import { config } from "../config/env";
import { logger } from "../config/logger";

import { Sequelize } from "sequelize";
import { File, initFileModel } from "../models/file.model";
import { Record, initRecordModel } from "../models/record.model";
import { Rank, initRankModel } from "../models/ranks.model";
import { Department, initDepartmentModel } from "../models/department.model";
import { Account, initAccountModel } from "../models/account.model";
import { RefreshToken, initRefreshTokenModel } from "../models/refreshToken.model";
import { Landuse, initLanduseModel } from "../models/landuse.model";
// import { DetailedLanduse, initDetailedLanduseModel } from "../models/detailed_landuse.model";
import { Purpose, initPurposeModel } from "../models/purpose.model";
import { GroundRentRate, initGroundRentRateModel } from "../models/groundRentRate.model";
import { Zone, initZoneModel } from "../models/zone.model";
import { LGA, initLGAModel } from "../models/lga.model";
import { FilePurposeHistory, initFilePurposeHistoryModel } from "../models/file-purpose-history.model";
import { GroundRentAssessment, initGroundRentAssessmentModel } from "../models/groundRentAssessment.model";
import { GroundRentAssessmentItem, initGroundRentAssessmentItemModel } from "../models/groundRentAssessmentItem.model";
import { FileGrant, initFileGrantModel } from "../models/file_grants.model";
import { FileAreaHistory, initFileAreaHistoryModel } from "../models/file_area_history.model";
import { FileNameHistory, initFileNameHistoryModel } from "../models/file_name_history.model";
import { GroundRentPayment, initGroundRentPaymentModel } from "../models/groundRentPayment.model";
import { GroundRentPaymentAllocation, initGroundRentPaymentAllocationModel } from "../models/ground_rent_payment_allocations.model";
import { GroundRentPenalty, initGroundRentPenaltyModel } from "../models/GroundRentPenalty.model";
import { GroundRentCredit, initGroundRentCreditModel } from "../models/groundRentCredit.model";
import { GroundRentPaymentYear, initGroundRentPaymentYearModel } from "../models/groundRentPaymentYear.model";
import { GroundRentYearStatus, initGroundRentYearStatusModel } from "../models/groundRentYearStatus.model";

export interface Database {
    sequelize: Sequelize;
    File: typeof File;
    Record: typeof Record;
    RefreshToken: typeof RefreshToken;
    Account: typeof Account;
    Department: typeof Department;
    Rank: typeof Rank;
    Landuse: typeof Landuse;
    // DetailedLanduse: typeof DetailedLanduse;
    Purpose: typeof Purpose;
    Zone: typeof Zone;
    GroundRentRate: typeof GroundRentRate;
    LGA: typeof LGA;
    FilePurposeHistory: typeof FilePurposeHistory;
    GroundRentAssessment: typeof GroundRentAssessment;
    GroundRentAssessmentItem: typeof GroundRentAssessmentItem;
    FileGrant: typeof FileGrant;
    FileAreaHistory: typeof FileAreaHistory;
    FileNameHistory: typeof FileNameHistory;
    GroundRentPayment: typeof GroundRentPayment;
    GroundRentPaymentAllocation: typeof GroundRentPaymentAllocation;
    GroundRentPenalty: typeof GroundRentPenalty;
    GroundRentCredit: typeof GroundRentCredit;
    GroundRentPaymentYear: typeof GroundRentPaymentYear;
    GroundRentYearStatus: typeof GroundRentYearStatus;
}

export let db: Database;

export const initialize = async () => {
    const sequelize = new Sequelize(
        config.db.name,
        config.db.user,
        config.db.pass,
        {
            host: config.db.host,
            dialect: "postgres",
            port: config.db.port,
        }
    );

    initAccountModel(sequelize);
    initRefreshTokenModel(sequelize);
    initFileModel(sequelize);
    initLanduseModel(sequelize);
    // initDetailedLanduseModel(sequelize);
    initPurposeModel(sequelize);
    initRecordModel(sequelize);
    initDepartmentModel(sequelize);
    initRankModel(sequelize);
    initZoneModel(sequelize);
    initGroundRentRateModel(sequelize);
    initLGAModel(sequelize);
    initFilePurposeHistoryModel(sequelize);
    initGroundRentAssessmentModel(sequelize);
    initGroundRentAssessmentItemModel(sequelize);
    initFileGrantModel(sequelize);
    initFileAreaHistoryModel(sequelize);
    initFileNameHistoryModel(sequelize);
    initGroundRentPaymentModel(sequelize);
    initGroundRentPaymentAllocationModel(sequelize);
    initGroundRentPenaltyModel(sequelize);
    initGroundRentCreditModel(sequelize);
    initGroundRentPaymentYearModel(sequelize);
    initGroundRentYearStatusModel(sequelize);
    Account.hasMany(RefreshToken, {
        foreignKey: "account_id",
        onDelete: "CASCADE",
        as: "refreshTokens",
    });

    RefreshToken.belongsTo(Account, {
        foreignKey: "account_id",
    });

    Landuse.hasMany(Purpose, {
        foreignKey: "landuse_id",
        as: "detailedLanduses"
    })

    Purpose.belongsTo(Landuse, {
        foreignKey: "landuse_id",
    })

    Department.hasMany(Rank, {
        foreignKey: "department_id",
        onDelete: "CASCADE",
        as: "ranks",
    });

    Rank.belongsTo(Department, {
        foreignKey: "department_id",
    });

    Rank.hasMany(Account, {
        foreignKey: "rank_id",
        as: "accounts",
    });

    Account.belongsTo(Rank, {
        foreignKey: "rank_id",
    });
    Record.belongsTo(Account, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    Account.hasMany(Record, {
        foreignKey: 'created_by',
        onDelete: "SET NULL",
        as: 'records',
    });
    File.hasOne(Record, {
        foreignKey: "file_id",
        onDelete: "CASCADE"
    });
    Record.belongsTo(File, {
        foreignKey: "file_id",
    });

    Landuse.hasMany(File, {
        foreignKey: "landuse_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    })
    File.belongsTo(Account, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    Account.hasMany(File, {
        foreignKey: 'created_by',
        onDelete: "SET NULL",
        as: 'files',
    });
    File.belongsTo(Landuse, {
        foreignKey: "landuse_id",
    });

    Purpose.hasMany(File, {
        foreignKey: "purpose_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    })

    File.belongsTo(Purpose, {
        foreignKey: "purpose_id",
    });

    LGA.hasMany(GroundRentRate, {
        foreignKey: "lga_id",
        as: "groundRentRates",
    });

    GroundRentRate.belongsTo(LGA, {
        foreignKey: "lga_id",
    });

    Purpose.hasMany(GroundRentRate, {
        foreignKey: "purpose_id",
        as: "groundRentRates",
    });

    GroundRentRate.belongsTo(Purpose, {
        foreignKey: "purpose_id",
    });

    File.hasMany(FilePurposeHistory, {
        foreignKey: "file_id",
        as: "purposeHistory",
        onDelete: "CASCADE",
    });

    FilePurposeHistory.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });


    Purpose.hasMany(FilePurposeHistory, {
        foreignKey: "purpose_id",
        as: "filePurposeHistory",
        onDelete: "RESTRICT",
    });

    FilePurposeHistory.belongsTo(Purpose, {
        foreignKey: "purpose_id",
        as: "purpose",
    });

    File.hasMany(GroundRentAssessment, {
        foreignKey: "file_id",
        as: "groundRentAssessments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    GroundRentAssessment.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });

    GroundRentAssessment.hasMany(GroundRentAssessmentItem, {
        foreignKey: "assessment_id",
        as: "items",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    GroundRentAssessmentItem.belongsTo(GroundRentAssessment, {
        foreignKey: "assessment_id",
        as: "assessment",
    });

    GroundRentRate.hasMany(GroundRentAssessmentItem, {
        foreignKey: "rate_id",
        as: "assessmentItems",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    GroundRentAssessmentItem.belongsTo(GroundRentRate, {
        foreignKey: "rate_id",
        as: "rate",
    });

    File.hasMany(FileGrant, {
        foreignKey: "file_id",
        as: "grants",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    FileGrant.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });
    File.hasMany(FileAreaHistory, {
        foreignKey: "file_id",
        as: "areaHistory",
        onDelete: "CASCADE",
    });

    FileAreaHistory.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });

    File.hasMany(FileNameHistory, {
        foreignKey: "file_id",
        as: "nameHistory",
        onDelete: "CASCADE",
    });

    FileNameHistory.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });
    File.hasMany(GroundRentPayment, {
        foreignKey: "file_id",
        as: "groundRentPayments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    GroundRentPayment.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });
    Zone.hasMany(LGA, {
        foreignKey: "zone_id",
        as: "lgas",
    });

    LGA.belongsTo(Zone, {
        foreignKey: "zone_id",
        as: "zone",
    });
    GroundRentPayment.hasMany(GroundRentPaymentAllocation, {
        foreignKey: "payment_id",
        as: "allocations",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    GroundRentPaymentAllocation.belongsTo(GroundRentPayment, {
        foreignKey: "payment_id",
        as: "payment",
    });

    GroundRentAssessmentItem.hasMany(GroundRentPaymentAllocation, {
        foreignKey: "assessment_item_id",
        as: "paymentAllocations",
        onDelete: "RESTRICT",
    });

    GroundRentPaymentAllocation.belongsTo(GroundRentAssessmentItem, {
        foreignKey: "assessment_item_id",
        as: "assessmentItem",
    });


    File.hasMany(GroundRentPenalty, {
        foreignKey: "file_id",
        as: "groundRentPenalties",
        onDelete: "CASCADE",
    });

    GroundRentPenalty.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });


    File.hasMany(GroundRentCredit, {
        foreignKey: "file_id",
        as: "groundRentCredits",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    GroundRentCredit.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });

    GroundRentPayment.hasOne(GroundRentCredit, {
        foreignKey: "payment_id",
        as: "credit",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });

    GroundRentCredit.belongsTo(GroundRentPayment, {
        foreignKey: "payment_id",
        as: "payment",
    });
    GroundRentPayment.hasMany(GroundRentPaymentYear, {
        foreignKey: "payment_id",
        as: "coveredYears",
    });

    GroundRentPaymentYear.belongsTo(GroundRentPayment, {
        foreignKey: "payment_id",
        as: "payment",
    });

    File.hasMany(GroundRentYearStatus, {
        foreignKey: "file_id",
        as: "groundRentYearStatuses",
    });

    GroundRentYearStatus.belongsTo(File, {
        foreignKey: "file_id",
        as: "file",
    });
    File.belongsTo(LGA, {
        foreignKey: "lga_id",
    });

    LGA.hasMany(File, {
        foreignKey: "lga_id",
    });

    await sequelize.authenticate();
    await sequelize.sync();

    db = {
        sequelize,
        File,
        Record,
        Account,
        RefreshToken,
        Department,
        Rank,
        Landuse,
        Purpose,
        Zone,
        GroundRentRate,
        LGA,
        FilePurposeHistory,
        GroundRentAssessment,
        GroundRentAssessmentItem,
        FileGrant,
        FileAreaHistory,
        FileNameHistory,
        GroundRentPayment,
        GroundRentPaymentAllocation,
        GroundRentPenalty,
        GroundRentCredit,
        GroundRentPaymentYear,
        GroundRentYearStatus,
    };
};
