
import {
    DataTypes,
    Model,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    NonAttribute,
    BelongsToGetAssociationMixin,
} from "sequelize";

import { File } from "./file.model";

export type GroundRentYearStatusValue =
    | "UNVERIFIED"
    | "PAID"
    | "UNPAID";

export class GroundRentYearStatus extends Model<
    InferAttributes<GroundRentYearStatus>,
    InferCreationAttributes<GroundRentYearStatus>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;
    declare rent_year: number;

    declare status: GroundRentYearStatusValue;
    declare notes: string | null;

    declare verified_by: string | null;
    declare verified_at: Date | null;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare file?: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initGroundRentYearStatusModel = (
    sequelize: Sequelize
) => {
    GroundRentYearStatus.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            file_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            rent_year: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1900,
                    max: 9999,
                    isInt: true,
                },
            },

            status: {
                type: DataTypes.ENUM(
                    "UNVERIFIED",
                    "PAID",
                    "UNPAID"
                ),
                allowNull: false,
                defaultValue: "UNVERIFIED",
            },

            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            verified_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            verified_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "ground_rent_year_status",
            tableName: "ground_rent_year_statuses",
            underscored: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",

            indexes: [
                {
                    unique: true,
                    fields: ["file_id", "rent_year"],
                    name: "ground_rent_year_status_file_year_unique",
                },
            ],
        }
    );
};
