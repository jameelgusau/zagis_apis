import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, HasOneGetAssociationMixin, CreationOptional, ForeignKey, HasManyGetAssociationsMixin } from "sequelize";
import { Record } from "./record.model";
import { Account } from "./account.model";
import { Landuse } from "./landuse.model";
import { Purpose } from "./purpose.model";

export class File extends Model<
    InferAttributes<File>,
    InferCreationAttributes<File>
> {
    declare id: CreationOptional<string>;

    declare cofo_number: string;
    declare title_holder_name: string;
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare landuse_id: ForeignKey<Landuse["id"]> | null;
    declare purpose_id: ForeignKey<Purpose["id"]> | null;
    // declare created_by: string;
    declare record?: Record;
    declare getRecord: HasOneGetAssociationMixin<Record>;

}

export const initFileModel = (sequelize: Sequelize) => {
    File.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            cofo_number: { type: DataTypes.STRING(15), allowNull: false, defaultValue: "", unique: true },
            title_holder_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "file",
            underscored: true,
            timestamps: true,
            hooks: {
                beforeValidate(file) {
                    if (file.cofo_number) {
                        file.cofo_number = file.cofo_number.trim().toUpperCase();
                    }
                    if (file.title_holder_name) {
                        file.title_holder_name = file.title_holder_name.trim().toUpperCase();
                    }
                }
            }

        }
    );
};

