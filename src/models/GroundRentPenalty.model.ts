
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

export class GroundRentPenalty extends Model<
    InferAttributes<GroundRentPenalty>,
    InferCreationAttributes<GroundRentPenalty>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;
    declare billing_year: number;

    declare penalty_rate: string;
    declare base_amount: string;
    declare amount: string;

    declare penalty_date: Date;
    declare created_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initGroundRentPenaltyModel = (
    sequelize: Sequelize
) => {
    GroundRentPenalty.init(
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

            billing_year: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            penalty_rate: {
                type: DataTypes.DECIMAL(8, 4),
                allowNull: false,
                defaultValue: 5.0,
                validate: { min: 0 },
            },

            base_amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: { min: 0 },
            },

            amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: { min: 0 },
            },

            penalty_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "ground_rent_penalty",
            tableName: "ground_rent_penalties",
            underscored: true,
            timestamps: false,

            indexes: [
                {
                    unique: true,
                    fields: ["file_id", "billing_year"],
                    name: "ground_rent_penalties_file_year_unique",
                },
            ],
        }
    );
};