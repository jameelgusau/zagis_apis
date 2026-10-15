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

export class GroundRentPayment extends Model<
    InferAttributes<GroundRentPayment>,
    InferCreationAttributes<GroundRentPayment>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;

    declare payment_reference: string;

    declare payment_date: Date;

    declare amount: string;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initGroundRentPaymentModel = (
    sequelize: Sequelize
) => {
    GroundRentPayment.init(
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

            payment_reference: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },

            payment_date: {
                type: DataTypes.DATEONLY,
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

            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "ground_rent_payment",
            tableName: "ground_rent_payments",
            underscored: true,

            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
};