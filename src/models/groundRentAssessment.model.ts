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

export class GroundRentAssessment extends Model<
    InferAttributes<GroundRentAssessment>,
    InferCreationAttributes<GroundRentAssessment>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;

    declare calculation_date: Date;
    declare commencement_date: Date;

    declare area_sqm: string;
    declare total_amount: string;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Association
    declare file: NonAttribute<File>;
    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initGroundRentAssessmentModel = (sequelize: Sequelize) => {
    GroundRentAssessment.init(
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

            calculation_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            commencement_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            area_sqm: {
                type: DataTypes.DECIMAL(18, 4),
                allowNull: false,
                validate: {
                    min: 0,
                },
            },

            total_amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: {
                    min: 0,
                },
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
            modelName: "ground_rent_assessment",
            tableName: "ground_rent_assessments",
            underscored: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
};