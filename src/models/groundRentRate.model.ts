
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

import { LGA } from "./lga.model";
import { Purpose } from "./purpose.model";

export class GroundRentRate extends Model<
    InferAttributes<GroundRentRate>,
    InferCreationAttributes<GroundRentRate>
> {
    declare id: CreationOptional<string>;

    declare lga_id: ForeignKey<LGA["id"]>;
    declare lga?: NonAttribute<LGA>;
    declare getLga: BelongsToGetAssociationMixin<LGA>;

    declare purpose_id: ForeignKey<Purpose["id"]>;
    declare purpose?: NonAttribute<Purpose>;
    declare getPurpose: BelongsToGetAssociationMixin<Purpose>;

    declare rate_per_sqm: number;

    declare effective_from: Date;
    declare effective_to: Date | null;
}

export const initGroundRentRateModel = (sequelize: Sequelize) => {
    GroundRentRate.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },

            lga_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            purpose_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            rate_per_sqm: {
                type: DataTypes.DECIMAL(18, 4),
                allowNull: false,
            },

            effective_from: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            effective_to: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "ground_rent_rate",
            tableName: "ground_rent_rates",
            underscored: true,
            timestamps: true,
        }
    );
};