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

export class FileGrant extends Model<
    InferAttributes<FileGrant>,
    InferCreationAttributes<FileGrant>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;

    declare grant_type: "ORIGINAL" | "REGRANT";

    declare commencement_date: Date;

    declare expiry_date: Date;

    declare created_at: CreationOptional<Date>;

    declare updated_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initFileGrantModel = (sequelize: Sequelize) => {
    FileGrant.init(
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

            grant_type: {
                type: DataTypes.ENUM("ORIGINAL", "REGRANT"),
                allowNull: false,
            },

            commencement_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            expiry_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
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
            modelName: "file_grant",
            tableName: "file_grants",
            underscored: true,

            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
};