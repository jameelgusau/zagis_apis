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
import { Account } from "./account.model";

export class Record extends Model<
    InferAttributes<Record>,
    InferCreationAttributes<Record>
> {
    declare id: CreationOptional<string>;
    declare registration_date: Date | null;
    declare execution_date: Date | null;
    declare collection_date: Date | null;
    declare page_number: number | null;
    declare volume_number: number | null;
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare serial_number: number | null;
    declare collected: "Yes" | "No" | null;
    declare certificate_type: "Certificate" | "Letter of Grant" | "Temporary" | null
    declare file_id: ForeignKey<File["id"]>;
    declare file: NonAttribute<File>;
    declare getFile: BelongsToGetAssociationMixin<File>;
}


export const initRecordModel = (sequelize: Sequelize) => {
    Record.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        file_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },
        registration_date: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
        execution_date: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
        collection_date: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
        page_number: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        volume_number: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        serial_number: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
        collected: {
            type: DataTypes.ENUM("Yes", "No"), allowNull: true,
            defaultValue: "No",
        },
        certificate_type: {
            type: DataTypes.ENUM("Certificate", "Letter of Grant", "Temporary"), allowNull: true,
            defaultValue: null,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: "record",
        underscored: true,
        timestamps: true,
    }
    )
}