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

export class LGA extends Model<
    InferAttributes<LGA>,
    InferCreationAttributes<LGA>
> {
    declare id: CreationOptional<string>;

    declare name: string;

    declare zone_id: ForeignKey<Zone["id"]>;
    declare zone?: NonAttribute<Zone>;
    declare getZone: BelongsToGetAssociationMixin<Zone>;
}

export const initLGAModel = (sequelize: Sequelize) => {
    LGA.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },

            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },

            zone_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "lga",
            tableName: "lgas",
            underscored: true,
            timestamps: true,
        }
    );
};
