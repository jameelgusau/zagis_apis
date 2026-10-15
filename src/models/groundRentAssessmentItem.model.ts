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
        HasManyGetAssociationsMixin,
} from "sequelize";

import { GroundRentPaymentAllocation } from "./ground_rent_payment_allocations.model";
import { GroundRentAssessment } from "./groundRentAssessment.model";
import { GroundRentRate } from "./groundRentRate.model";

export class GroundRentAssessmentItem extends Model<
    InferAttributes<GroundRentAssessmentItem>,
    InferCreationAttributes<GroundRentAssessmentItem>
> {
    declare id: CreationOptional<string>;

    declare assessment_id: ForeignKey<GroundRentAssessment["id"]>;
    declare rate_id: ForeignKey<GroundRentRate["id"]>;

    declare rent_year: number;
    declare payment_due_date: Date;

    declare period_start: Date;
    declare period_end: Date;

    declare area_sqm: string;
    declare rate_per_sqm: string;

    declare amount: string;

    declare created_at: CreationOptional<Date>;

    // Associations
    declare assessment: NonAttribute<GroundRentAssessment>;
    declare rate: NonAttribute<GroundRentRate>;

    declare paymentAllocations: NonAttribute<GroundRentPaymentAllocation[]>;

declare getPaymentAllocations: HasManyGetAssociationsMixin<GroundRentPaymentAllocation>;

    declare getAssessment: BelongsToGetAssociationMixin<GroundRentAssessment>;
    declare getRate: BelongsToGetAssociationMixin<GroundRentRate>;
}

export const initGroundRentAssessmentItemModel = (
    sequelize: Sequelize
) => {
    GroundRentAssessmentItem.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            assessment_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            rate_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            rent_year: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            payment_due_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            period_start: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            period_end: {
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

            rate_per_sqm: {
                type: DataTypes.DECIMAL(18, 4),
                allowNull: false,
                validate: {
                    min: 0,
                },
            },

            amount: {
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
        },
        {
            sequelize,
            modelName: "ground_rent_assessment_item",
            tableName: "ground_rent_assessment_items",
            underscored: true,
            timestamps: false,
        }
    );
};
