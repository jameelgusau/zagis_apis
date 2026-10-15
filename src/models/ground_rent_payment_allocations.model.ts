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

import { GroundRentPayment } from "./groundRentPayment.model";
import { GroundRentAssessmentItem } from "./groundRentAssessmentItem.model";

export class GroundRentPaymentAllocation extends Model<
    InferAttributes<GroundRentPaymentAllocation>,
    InferCreationAttributes<GroundRentPaymentAllocation>
> {
    declare id: CreationOptional<string>;

    declare payment_id: ForeignKey<GroundRentPayment["id"]>;

    declare assessment_item_id: ForeignKey<
        GroundRentAssessmentItem["id"]
    >;

    declare amount: string;

    declare created_at: CreationOptional<Date>;

    declare payment: NonAttribute<GroundRentPayment>;
    declare assessmentItem: NonAttribute<GroundRentAssessmentItem>;

    declare getPayment: BelongsToGetAssociationMixin<GroundRentPayment>;
    declare getAssessmentItem: BelongsToGetAssociationMixin<GroundRentAssessmentItem>;
}

export const initGroundRentPaymentAllocationModel = (
    sequelize: Sequelize
) => {
    GroundRentPaymentAllocation.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            payment_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            assessment_item_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
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
            modelName: "ground_rent_payment_allocation",
            tableName: "ground_rent_payment_allocations",
            underscored: true,
            timestamps: false,
        }
    );
};