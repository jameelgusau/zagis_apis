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
import { Purpose } from "./purpose.model";

export class FilePurposeHistory extends Model<
    InferAttributes<FilePurposeHistory>,
    InferCreationAttributes<FilePurposeHistory>
> {
    declare id: CreationOptional<string>;

    declare file_id: ForeignKey<File["id"]>;
    declare purpose_id: ForeignKey<Purpose["id"]>;

    declare effective_from: Date;
    declare effective_to: Date | null;

    declare created_at: CreationOptional<Date>;

    // Associations
    declare file: NonAttribute<File>;
    declare purpose: NonAttribute<Purpose>;

    declare getFile: BelongsToGetAssociationMixin<File>;
    declare getPurpose: BelongsToGetAssociationMixin<Purpose>;
}

export const initFilePurposeHistoryModel = (sequelize: Sequelize) => {
    FilePurposeHistory.init(
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

            purpose_id: {
                type: DataTypes.UUID,
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
            modelName: "file_purpose_history",
            tableName: "file_purpose_history",
            underscored: true,
            timestamps: false,

           validate: {
            effectiveDateRange() {
                if (
                    this.effective_to !== null &&
                    this.effective_to !== undefined &&
                    this.effective_from &&
                    this.effective_to < this.effective_from
                ) {
                    throw "effective_to must be greater than or equal to effective_from"
            
                }
            },
        },

        }
    );
};