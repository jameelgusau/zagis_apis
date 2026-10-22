
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
import { GroundRentPayment } from "./groundRentPayment.model";

export class GroundRentCredit extends Model<
    InferAttributes<GroundRentCredit>,
    InferCreationAttributes<GroundRentCredit>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;
    declare payment_id: ForeignKey<GroundRentPayment["id"]>;

    declare original_amount: string;
    declare remaining_amount: string;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;
    declare payment: NonAttribute<GroundRentPayment>;

    declare getFile: BelongsToGetAssociationMixin<File>;
    declare getPayment: BelongsToGetAssociationMixin<GroundRentPayment>;
}

export const initGroundRentCreditModel = (
    sequelize: Sequelize
) => {
    GroundRentCredit.init(
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

            payment_id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
            },

            original_amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: { min: 0.01 },
            },

            remaining_amount: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false,
                validate: { min: 0 },
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
            modelName: "ground_rent_credit",
            tableName: "ground_rent_credits",
            underscored: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
};