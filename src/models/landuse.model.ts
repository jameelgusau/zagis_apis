import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional, ForeignKey, HasManyGetAssociationsMixin } from "sequelize";
import { Purpose } from "./purpose.model";
import { Account } from "./account.model";

export class Landuse extends Model<
    InferAttributes<Landuse>,
    InferCreationAttributes<Landuse>
> {
    declare id: CreationOptional<string>;
    declare landuse_name: string
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare purposes?: Purpose;
    declare getPurposes: HasManyGetAssociationsMixin<Purpose>;

}
export const initLanduseModel = (sequelize: Sequelize) => {
    Landuse.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            landuse_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
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
            modelName: "landuse",
            underscored: true,
            timestamps: true,
            hooks: {
                beforeValidate(landuse) {
                    if (landuse.landuse_name) {
                        landuse.landuse_name = landuse.landuse_name.trim().toUpperCase();
                    }
                }
            }
        }
    );
};

