import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional, ForeignKey, BelongsToGetAssociationMixin } from "sequelize";
import { Account } from "./account.model";
import { Landuse } from "./landuse.model";

export class Purpose extends Model<
    InferAttributes<Purpose>,
    InferCreationAttributes<Purpose>
> {
    declare id: CreationOptional<string>;
    declare purpose_name: string;
    declare lease_years: number;
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare landuse_id: ForeignKey<Landuse["id"]>;
    declare landuse?: Landuse;
    declare getLanduse: BelongsToGetAssociationMixin<Landuse>; 
}

export const initPurposeModel = (sequelize: Sequelize) => {
    Purpose.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            purpose_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
            lease_years: { type: DataTypes.INTEGER(), allowNull: false, defaultValue: 0 },
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
            modelName: "purpose",
            underscored: true,
            timestamps: true,
            hooks: {
                beforeValidate(purpose) {
                    if (purpose.purpose_name) {
                        purpose.purpose_name = purpose.purpose_name.trim().toUpperCase();
                    }
                }
            }
        }
    );
};

