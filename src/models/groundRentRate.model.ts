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

import { Zone } from "./zone.model";
import { Purpose } from "./purpose.model";

export class GroundRentRate extends Model<
    InferAttributes<GroundRentRate>,
    InferCreationAttributes<GroundRentRate>
> {
    declare id: CreationOptional<string>;

    declare zone_id: ForeignKey<Zone["id"]>;
    declare zone?: NonAttribute<Zone>;
    declare getZone: BelongsToGetAssociationMixin<Zone>;

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

            zone_id: {
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
            underscored: true,
            timestamps: true,
        }
    );
};
