import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional, ForeignKey, HasManyGetAssociationsMixin } from "sequelize";
import { Purpose } from "./purpose.model";
import { Account } from "./account.model";

export class DetailedLanduse extends Model<
    InferAttributes<DetailedLanduse>,
    InferCreationAttributes<DetailedLanduse>
> {
    declare id: CreationOptional<string>;
    declare detailed_landuse_name: string
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare purposes?: NonAttribute<Purpose[]>;
    declare getPurposes: HasManyGetAssociationsMixin<Purpose>;
}

export const initDetailedLanduseModel = (sequelize: Sequelize) => {
    DetailedLanduse.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            detailed_landuse_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: "detailed_landuse",
            underscored: true,
            timestamps: true,
        }
    );
};

