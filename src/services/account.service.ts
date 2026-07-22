import { promises as fsPromises } from "fs";
import fs from 'fs';
import { Op } from "sequelize";
import { db } from "../db";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import path from 'path';
import { logger } from "../config/logger";
import { UploadedFile } from 'express-fileupload';
import { config } from "../config/env";
import sharp from "sharp";
import randomTokenString from "../middlewares/random-token-string";
import hash from "../middlewares/hash";
import sendVerificationEmail from "../emails/sendVerification";
import sendPasswordResetEmail from "../emails/sendPasswordResetEmail";
import { basicUserDetails } from "../utils/basicDetails";
import { nanoid } from "nanoid";

interface Auth {
    email: string;
    password: string;
    ipAddress: string;
    protocol: string;
    host: string;
}

interface ForgotPass {
    origin: string | undefined
    email: string
}

interface ChangePass {
    current_password: string;
    password: string;
    id: string;
}

interface Token {
    token: string;
    current_password: string;
    password: string;
}

interface RefreshData {
    id: string
    ipAddress: string
}
interface AccountAttributes {
    full_name: string;
    email: string;
    rank_id: string;
    phone: string;
    origin: string | undefined;
    created_by: string;
    role: "Admin" | "User" | "Supervisor";


}

interface Profile extends AccountAttributes {
    id: string;

}


interface User extends Profile {
    protocol: string;
    host: string;
    image?: UploadedFile;
}



export const accountService = async (params: AccountAttributes) => {
    const account = await db.Account.findOne({
        where: {
            email: params.email.toLocaleLowerCase(),

        }
    })

    if (account) throw `Account with ${params.email} already exist`;

    const accoundata = {
        ...params,
        passwordHash: await hash("123456"),
        verificationToken: randomTokenString()

    }
    const findAdmin = await db.Account.findByPk(params.created_by);

    const obj = {
        appName: "ZAGIS",
        name: params.full_name,
        email: params.email,
        verificationToken: accoundata.verificationToken,
        adminName: findAdmin?.full_name || "Admin",
        created_by: params.created_by
    }
    const createAccount = new db.Account(accoundata);
    await createAccount.save()

    await sendVerificationEmail(obj, params.origin);
}

export const authenticateService = async ({ email, password, ipAddress, protocol, host }: Auth) => {
    const account = await db.Account.scope("withHash").findOne({
        where: { email: email.toLowerCase() },
        include: [{
            model: db.Rank,
            include: [db.Department]
        }],
    });

    if (
        !account || !account.isVerified ||
        !(await bcrypt.compare(password, account.get('passwordHash')))
    ) {
        throw "Email or password is incorrect";
    }
    const jwtToken = await generateJwtToken(account);
    const refreshToken = generateRefreshToken({ id: account.id, ipAddress });
    await refreshToken.save();
    return {
        ...basicUserDetails(account),
        jwtToken,
        link: account?.image && `${protocol}://${host}/img/profiles/${account?.image}`,
        refreshToken: refreshToken.token,
    };
}

export const updateAccountService = async (params: Profile) => {
    const account = await getAccount(params.id);

    if (params.email && account.email !== params.email && await db.Account.findOne({
        where: {
            email: {
                [Op.iLike]: params.email
            }
        }
    })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    Object.assign(account, params)
    return await account.save();
};

export const verifyEmailService = async ({ token, password }: Token) => {
    const account = await db.Account.findOne({
        where: {
            verificationToken: token
        }
    })
    if (!account) throw "Verification failed";
    const passwordHash = await hash(password);
    account.passwordHash = passwordHash;
    account.verified = new Date(Date.now());
    account.verificationToken = null;
    await account.save();
}

export const resetPasswordService = async ({ token, password }: { token: string, password: string }) => {
    const account = await validateResetToken({ token });
    account.passwordHash = await hash(password);
    account.password_reset = new Date(Date.now());
    account.reset_token = null;
    await account.save();
}

export const changePasswordService = async ({ current_password, password, id }: ChangePass) => {
    // const account = await validateResetToken({ token });
    const account = await db.Account.scope("withHash").findByPk(id);
    if (!account) throw "Unauthorized";
    const checkPass = await bcrypt.compare(current_password, account.passwordHash)
    if (!checkPass) {
        throw "Current password is not correct!"
    }

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.password_reset = new Date(Date.now());
    await account.save();
}

export const forgotPasswordService = async ({ email, origin }: ForgotPass) => {
    const account = await db.Account.findOne({       where: {
            email: {
                [Op.iLike]: email
            }
        } });
    if (!account) throw "Email is not registered";
    account.reset_token = randomTokenString();
    account.reset_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await account.save();

    await sendPasswordResetEmail({ email, reset_token: account.reset_token, full_name: account.full_name, appName: "Zagis" }, origin);
}

export const deleteAccountService = async (id: string) => {
    const account = await getAccount(id);
    await account.destroy();
}

export const getAccount = async (id: string) => {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

const validateResetToken = async ({ token }: { token: string }) => {
    const account = await db.Account.findOne({
        where: {
            reset_token: token,
            reset_token_expires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}
const generateRefreshToken = (params: RefreshData) => {
    // create a refresh token that expires in a day
    let refreshToken;
    refreshToken = new db.RefreshToken({
        account_id: params.id,
        token: randomTokenString(),
        // expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdByIp: params.ipAddress,
    });
    return refreshToken
}
const generateJwtToken = async (account: { id: string, email: string }) => {

    // create a jwt token containing the account id that expires in 50 minutes
    return jwt.sign({ sub: account.id, id: account.id, email: account.email }, config.secret_key, {
        expiresIn: "50m",
    });
}
export const revokeTokenService = async ({ token, ipAddress }: { token: string, ipAddress: string }) => {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = new Date();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

export const refreshTokenService = async ({ token, ipAddress, protocol, host }: {
    token: string; ipAddress: string; protocol: string;
    host: string;
}) => {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken({ id: account.id, ipAddress });
    refreshToken.revoked = new Date(Date.now());
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = await generateJwtToken(account);
    return {
        ...basicUserDetails(account),
        jwtToken,
        link: account?.image && `${protocol}://${host}/img/profiles/${account?.image}`,
        refreshToken: newRefreshToken.token,
    };
}


const getRefreshToken = async (token: string) => {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
    return refreshToken;
}

export const streamImageService = async (folder: string, file: string): Promise<fs.ReadStream> => {
    try {
        const rootPath: string = path.join(__dirname, '..', 'images', folder, file);
        await fsPromises.access(rootPath); // Check if file exists asynchronously
        return fs.createReadStream(rootPath);
    } catch (error) {
        throw 'File not found';
    }
}

export const getUsersServices = async () => {
    const users = await db.Account.findAll({
        order: [['full_name', 'ASC']],
        include: [{
            model: db.Rank,
            include: [db.Department]
        }],

    });
    const result = users.map((file) => {
        const data = file.toJSON();
        return {

            ...(data?.rank || {}),
            ...(data.rank?.department || {}),
            ...data,
            isVerified: file.isVerified,
            rank: undefined,
        };
    });
    return result
}

export const updateUserService = async (params: User) => {
    const account = await getAccount(params.id);

    if (params.email && account.email !== params.email && await db.Account.findOne({
        where: {
            email: {
                [Op.iLike]: params.email
            }
        }
    })) {
        throw 'Email "' + params.email + '" is already taken';
    }
    const oldImage = account.image;

    if (params.image) {
        const dirPath = path.join(__dirname, "..", "images", "profiles");
        await fsPromises.mkdir(dirPath, { recursive: true });

        const fileName = `${Date.now()}-${nanoid()}.webp`;
        const filePath = path.join(dirPath, fileName);

        const data =
            Buffer.isBuffer(params.image)
                ? params.image
                : params.image.data;

        await sharp(data)
            .resize(730, 630, { fit: "inside" })
            .webp({ quality: 35 })
            .toFile(filePath);

        account.image = fileName;

        // delete old image
        if (oldImage) {
            const oldPath = path.join(dirPath, oldImage);
            try {
                await fsPromises.unlink(oldPath);
            } catch (err: any) {
                if (err.code !== "ENOENT") throw err;
            }
        }
    }

    account.phone = params.phone;
    account.full_name = params.full_name;
    account.email = params.email
    await account.save();

    const link =
        account.image?.startsWith("https://")
            ? account.image
            : account.image
                ? `${params.protocol}://${params.host}/img/profiles/${account.image}`
                : "";

    return {
        ...basicUserDetails(account),
        link,
    };
};