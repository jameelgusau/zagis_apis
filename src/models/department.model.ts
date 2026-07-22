import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional, ForeignKey, HasManyGetAssociationsMixin } from "sequelize";
import { Rank } from "./ranks.model";
import { Account } from "./account.model";

export class Department extends Model<
    InferAttributes<Department>,
    InferCreationAttributes<Department>
> {
    declare id: CreationOptional<string>;
    declare department_name: string
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;
    declare ranks?: NonAttribute<Rank[]>;
    declare getRanks: HasManyGetAssociationsMixin<Rank>;

}

export const initDepartmentModel = (sequelize: Sequelize) => {
    Department.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            department_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
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
            modelName: "department",
            underscored: true,
            timestamps: true,
        }
    );
};

