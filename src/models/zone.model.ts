import {
    DataTypes,
    Model,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";

export class Zone extends Model<
    InferAttributes<Zone>,
    InferCreationAttributes<Zone>
> {
    declare id: CreationOptional<string>;

    declare name: string;
    declare description: string | null;
    
}

export const initZoneModel = (sequelize: Sequelize) => {
    Zone.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },

            description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "zone",
            tableName: "zones",
            underscored: true,
            timestamps: true,
        }
    );
};
