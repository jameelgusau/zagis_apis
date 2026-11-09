
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

export class GroundRentPaymentYear extends Model<
    InferAttributes<GroundRentPaymentYear>,
    InferCreationAttributes<GroundRentPaymentYear>
> {
    declare id: CreationOptional<string>;

    declare payment_id: ForeignKey<GroundRentPayment["id"]>;
    declare rent_year: number;

    // Optional amount documented for this specific rent year.
    // Null means the individual yearly amount is not established.
    declare amount: string | null;

    declare verified: CreationOptional<boolean>;

    declare created_at: CreationOptional<Date>;

    declare payment?: NonAttribute<GroundRentPayment>;

    declare getPayment: BelongsToGetAssociationMixin<GroundRentPayment>;
}

export const initGroundRentPaymentYearModel = (
    sequelize: Sequelize
) => {
    GroundRentPaymentYear.init(
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

            rent_year: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1900,
                    max: 9999,
                    isInt: true,
                },
            },

            amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: true,
                validate: {
                    min: 0,
                },
            },

            verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "ground_rent_payment_year",
            tableName: "ground_rent_payment_years",
            underscored: true,
            timestamps: false,

            indexes: [
                {
                    unique: true,
                    fields: ["payment_id", "rent_year"],
                    name: "ground_rent_payment_year_unique",
                },
            ],
        }
    );
};
