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
        Purpose
    };
};
