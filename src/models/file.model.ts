import {
    DataTypes,
    Model,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    HasOneGetAssociationMixin,
    CreationOptional,
    ForeignKey,
} from "sequelize";

import { Record } from "./record.model";
import { Account } from "./account.model";
import { Landuse } from "./landuse.model";
import { Purpose } from "./purpose.model";
import { LGA } from "./lga.model";
import { FileGrant } from "./file_grants.model";

export class File extends Model<
    InferAttributes<File>,
    InferCreationAttributes<File>
> {
    declare id: CreationOptional<string>;

    declare cofo_number: string;
    declare title_holder_name: string;
    declare location: string | null;

    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;

    declare landuse_id: ForeignKey<Landuse["id"]> | null;
    declare purpose_id: ForeignKey<Purpose["id"]> | null;
    declare lga_id: ForeignKey<LGA["id"]> | null;

    declare area_sqm: number | null;

    declare record?: Record;
    declare getRecord: HasOneGetAssociationMixin<Record>;
    declare grants?: FileGrant[];
    declare getGrants: HasOneGetAssociationMixin<FileGrant>;

}

export const initFileModel = (sequelize: Sequelize) => {
    File.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            cofo_number: {
                type: DataTypes.STRING(15),
                allowNull: false,
                defaultValue: "",
                unique: true,
            },

            title_holder_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "",
            },
            location: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            landuse_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            purpose_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            lga_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },

            area_sqm: {
                type: DataTypes.DECIMAL(10, 2),
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
                        file.title_holder_name =
                            file.title_holder_name.trim().toUpperCase();
                    }
                },
            },
        }
    );
};
