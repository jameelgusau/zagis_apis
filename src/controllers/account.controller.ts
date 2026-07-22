import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import fs from 'fs';
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { accountService, authenticateService, changePasswordService, deleteAccountService, forgotPasswordService, refreshTokenService, resetPasswordService, revokeTokenService, streamImageService, updateAccountService, verifyEmailService, getUsersServices, updateUserService } from '../services/account.service'
import { Roles } from "../utils/roles";

export const AccountSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        full_name: Joi.string().required(),
        rank_id: Joi.string().guid().required(),
        phone: Joi.string().regex(/^\(*\+*[1-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/).messages({ 'string.pattern.base': `Phone number must have at least 10 digits.` }).required().trim(),
        email: Joi.string().email().required().trim(),
        role: Joi.string().valid(Roles.user, Roles.supervisor, Roles.admin).required()
    });
    validateRequest(req, next, schema)
}

export const Account = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body, protocol } = req
        const created_by = req?.auth?.id;
        const data = {
            ...body,
            created_by,
            protocol,
            host: req.get('host'),
            origin: req.get("origin")
        }
        const account = await accountService(data);
        res.json({
            meta: {
                status: 200,
                message: "Registration successful"
            },
            data: account
        });
    } catch (error) {
        next(error);
    }
}


export const updateAccountSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        full_name: Joi.string().required(),
        rank_id: Joi.string().guid().required(),
        phone: Joi.string().regex(/^\(*\+*[1-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/).messages({ 'string.pattern.base': `Phone number must have at least 10 digits.` }).required().trim(),
        email: Joi.string().email().required().trim(),
        role: Joi.string().valid(Roles.user, Roles.supervisor, Roles.admin)

    });
    validateRequest(req, next, schema);
}

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getUsersServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: users
        })

    } catch (error) {
        next(error)
    }
}


export const updateAccount = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        const { body, protocol } = req;
        const params = {
            ...body,
            updated_by: req.auth?.id,
            protocol,
            host: req.get('host')
        }

        const pro = await updateAccountService(params)
        res.json({
            meta: {
                status: 200,
                message: 'Profile update successful'
            },
            data: pro
        });
    } catch (error) {
        next(error);
    }
}

export const authenticateSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().required().trim(),
        password: Joi.string().required().trim()
    });
    validateRequest(req, next, schema);
}


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const { protocol } = req;
    const host = req.get('host') as string;
    const { email, password } = req.body;
    const ipAddress = req.ip || "";
    try {
        const { refreshToken, ...account } =
            await authenticateService({ email, password, ipAddress, protocol, host })
        setTokenCookie(res, refreshToken);
        res.json({
            meta: {
                status: 200,
                message: ''
            },
            data: account
        });
    } catch (error) {
        next(error);
    }

}

export const verifyEmailSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema)
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await verifyEmailService(req.body);
        res.json({
            meta: {
                status: 200,
                message: "Verification successful"
            },
            data: {}
        });
    } catch (error) {
        next(error);
    }
}

export const changePasswordSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        current_password: Joi.string().min(6).required(),
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

export const changePassword = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const params = {
            password: req.body.password,
            current_password: req.body.current_password,
            id: req.auth?.id
        }

        await changePasswordService(params)
        res.json({
            meta: {
                status: 200,
                message: 'Password reset successful'
            },
            data: {}
        });
    } catch (error) {
        next(error);
    }
}

export const updateUserSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        phone: Joi.string().regex(/^\(*\+*[1-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/).messages({ 'string.pattern.base': `Phone number must have at least 10 digits.` }).required(),
        full_name: Joi.string().required(),
        email: Joi.string().email().required().trim()

    });
    validateRequest(req, next, schema);
}


export const updateUser = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        const { body, files, protocol } = req;
        let params;
        if (files && files.image) {
            params = {
                ...body,
                id: req.auth?.id,
                image: files.image,
                protocol,
                host: req.get('host')
            }
        } else {
            params = {
                ...body,
                id: req.auth?.id,
                protocol,
                host: req.get('host')
            }
        }
        const pro = await updateUserService(params)
        res.json({
            meta: {
                status: 200,
                message: 'Profile update successful'
            },
            data: pro
        });
    } catch (error) {
        next(error);
    }
}


export const forgotPasswordSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = {
            email: req.body.email,
            origin: req.get("origin")
        }
        await forgotPasswordService(params)
        res.json({
            meta: {
                status: 200,
                message: 'Please check your email for password reset instructions'
            },
            data: {}
        });
    } catch (error) {
        next(error);
    }
}
export const resetPasswordSchema = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await resetPasswordService(req.body)
        res.json({
            meta: {
                status: 200,
                message: 'Password reset successful, you can now login'
            },
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const refreshToken = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refresh_token || "";
        const { protocol } = req;
        const host = req.get('host') as string;
        const ipAddress = req.ip || "";
        const { refreshToken, ...account } = await refreshTokenService({ token, ipAddress, protocol, host });
        setTokenCookie(res, refreshToken);
        res.json({
            meta: {
                status: 200,
                message: ''
            },
            data: account
        });
    } catch (error) {
        next(error)
    }
}


export const streamImages = async (req: Request, res: Response, next: NextFunction) => {
    const { folder, file } = req.params
    try {
        const stream = await streamImageService(folder as string, file as string);
        if (stream) {
            await streamImage(stream, res)
        } else {
            res.sendStatus(404)
        }
    } catch (error) {
        next(error)
    }
}


export const revokeTokenSchema = (req: JWTRequest, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        token: Joi.string().empty('')

    });
    validateRequest(req, next, schema);
}


export const revokeToken = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        // accept token from request body or cookie
        const token = req.body.token || req.cookies.refresh_token;
        const ipAddress = req.ip || "";
        if (!token) return res.status(400).json({
            meta: {
                status: 400,
                message: 'Token is required'
            },
            data: {}
        });
        // users can revoke their own tokens and admins can revoke any tokens
        if (!req?.auth?.ownsToken(token) && req?.auth?.role !== Roles.admin) {
            return res.status(401).json({
                meta: {
                    status: 401,
                    message: 'Unauthorized'
                },
                data: {}
            });
        }
        await revokeTokenService({ token, ipAddress })
        res.json({
            meta: {
                status: 200,
                message: 'Token revoked'
            },
            data: {}
        });
    } catch (error) {
        next(error)
    }
}


export const deleteAccount = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        // users can delete their own account and admins can delete any account
        if (req.params.id !== req.auth?.id && req.auth?.role !== Roles.admin) {
            return res.status(401).json({
                meta: {
                    status: 401,
                    message: "Unauthorized"
                },
                data: {}
            });
        }
        if (req.params.id == req.auth?.id && req.auth?.role == Roles.admin) {
            return res.status(401).json({
                meta: {
                    status: 401,
                    message: "Sorry! You can not delete your account as an Admin"
                },
                data: {}
            });
        }
        await deleteAccountService(req.params?.id as string)
        res.json({
            meta: {
                status: 200,
                message: "Account deleted successfully"
            },
            data: {

            }
        })
    } catch (error) {
        next(error)
    }
}

function streamImage(file: fs.ReadStream, res: Response) {
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader('Content-Disposition', 'attachment; filename="')
    file.pipe(res)
}

const setTokenCookie = (res: Response, token: string) => {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    res.cookie('refresh_token', token, cookieOptions);
}