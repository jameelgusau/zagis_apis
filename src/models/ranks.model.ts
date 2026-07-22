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
    HasManyGetAssociationsMixin
} from "sequelize";

import { Department } from "./department.model";
import { Account } from "./account.model";

export class Rank extends Model<
    InferAttributes<Rank>,
    InferCreationAttributes<Rank>
> {
    declare id: CreationOptional<string>;

    declare rank_name: string;
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;

    declare department_id: ForeignKey<Department["id"]>;
    declare department?: Department;
    declare getDepartment: BelongsToGetAssociationMixin<Department>;

    declare account?: NonAttribute<Account[]>;
    declare getAccounts: HasManyGetAssociationsMixin<Account>;
}

export const initRankModel = (sequelize: Sequelize) => {
    Rank.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },

            rank_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            department_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
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
            modelName: "rank",
            underscored: true,
            timestamps: true,
        }
    );
};
