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

import { Account } from "./account.model";

export class RefreshToken extends Model<
    InferAttributes<RefreshToken>,
    InferCreationAttributes<RefreshToken>
> {
    declare id: CreationOptional<string>;

    declare token: string;
    declare expires: Date;

    declare created: CreationOptional<Date>;
    declare createdByIp: string | null;

    declare revoked: Date | null;
    declare revokedByIp: string | null;
    declare replacedByToken: string | null;

    declare account_id: ForeignKey<Account["id"]>;
    declare account?: NonAttribute<Account>;
    declare getAccount: BelongsToGetAssociationMixin<Account>;

    // Virtuals (must be declared but NOT in DB)
    get isExpired(): NonAttribute<boolean> {
        return Date.now() >= new Date(this.expires).getTime();
    }

    get isActive(): NonAttribute<boolean> {
        return !this.revoked && !this.isExpired;
    }
}

export const initRefreshTokenModel = (sequelize: Sequelize) => {
    RefreshToken.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },

            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            expires: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            created: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },

            createdByIp: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            revoked: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            revokedByIp: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            replacedByToken: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            account_id: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "refresh_token",
            underscored: true,
            timestamps: true,
        }
    );
};
