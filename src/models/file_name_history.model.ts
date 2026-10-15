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

export class FileNameHistory extends Model<
    InferAttributes<FileNameHistory>,
    InferCreationAttributes<FileNameHistory>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;

    declare title_holder_name: string;

    declare effective_from: Date;

    declare effective_to: Date | null;

    declare created_at: CreationOptional<Date>;

    declare file: NonAttribute<File>;

    declare getFile: BelongsToGetAssociationMixin<File>;
}

export const initFileNameHistoryModel = (sequelize: Sequelize) => {
    FileNameHistory.init(
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

            title_holder_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
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
            modelName: "file_name_history",
            tableName: "file_name_history",
            underscored: true,
            timestamps: false,
        }
    );
};