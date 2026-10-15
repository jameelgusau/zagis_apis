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

export class FileAreaHistory extends Model<
    InferAttributes<FileAreaHistory>,
    InferCreationAttributes<FileAreaHistory>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;

    declare area_sqm: string;

    declare effective_from: Date;

    declare effective_to: Date | null;

    declare created_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initFileAreaHistoryModel = (sequelize: Sequelize) => {
    FileAreaHistory.init(
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

            area_sqm: {
                type: DataTypes.DECIMAL(18, 4),
                allowNull: false,
                validate: {
                    min: 0,
                },
            },

            effective_from: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            effective_to: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                defaultValue: null,
            },

            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "file_area_history",
            tableName: "file_area_history",
            underscored: true,
            timestamps: false,
        }
    );
};