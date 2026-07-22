import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional, ForeignKey, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from "sequelize";
import { RefreshToken } from "./refreshToken.model";
import { Rank } from "./ranks.model";

export class Account extends Model<
    InferAttributes<Account>,
    InferCreationAttributes<Account>
> {
    declare id: CreationOptional<string>;

    declare full_name: string;
    declare email: string;
    declare phone: string;
    declare passwordHash: string;

    declare role:
        "User"
        | "Admin"
        | "Supervisor"
    declare image: string | null;

    declare reset_token: string | null;
    declare reset_token_expires: Date | null;
    declare password_reset: Date | null;
    declare created_by: ForeignKey<Account["id"]> | null;
    declare updated_by: ForeignKey<Account["id"]> | null;

    declare verificationToken: string | null;
    declare verified: Date | null;
    declare refreshTokens?: NonAttribute<RefreshToken[]>;

    declare rank_id: ForeignKey<Rank["id"]>;
    declare rank?: Rank;
    declare getRank: BelongsToGetAssociationMixin<Rank>;

    declare getRefreshTokens: HasManyGetAssociationsMixin<RefreshToken>;
    get isVerified(): NonAttribute<boolean> {
        return !!(this.verified || this.password_reset)
    }
}

export const initAccountModel = (sequelize: Sequelize) => {
    Account.init(
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            full_name: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
            email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
            phone: { type: DataTypes.STRING(25), allowNull: false, defaultValue: "" },
            rank_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            passwordHash: { type: DataTypes.STRING(150), allowNull: false },
            role: { type: DataTypes.ENUM("Admin", "User", "Supervisor"), allowNull: false },
            image: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
            reset_token: { type: DataTypes.STRING(100) },
            reset_token_expires: { type: DataTypes.DATE },
            password_reset: { type: DataTypes.DATE, allowNull: true },
            verificationToken: { type: DataTypes.STRING(100) },
            verified: { type: DataTypes.DATE },
            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: "account",
            underscored: true,
            timestamps: true,
            defaultScope: {
                attributes: { exclude: ["passwordHash"] },
            },
            scopes: {
                withHash: {
                    attributes: {
                        include: ['passwordHash'],
                    }
                },
            },
            hooks: {
                beforeValidate(account) {
                    if (account.email) {
                        account.email = account.email.trim().toLowerCase();
                    }
                }
            }
        }
    );
};

