import { RequestHandler, Request, Response, NextFunction } from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import { db } from "../db";
import { config } from '../config/env';


interface TokenObject {
    token: string;
    // Other properties if available
}

function authorize(roles: string | string[] = []): RequestHandler[] {
    // roles param can be a single role string (e.g. 'User') 
    // or an array of roles (e.g ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    // let roles = [role]
    const secret = config.secret_key
    return [
        // authenticate JWT token and attach user to request object (req.user)
        expressjwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req: JWTRequest, res: Response, next: NextFunction) : Promise<any> => {
            const account = await db.Account.findByPk(req.auth?.id);
        
            if (!account || (roles.length && !roles.includes(account.role as string))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ meta: { message: 'Unauthorized', status: 401 }, data: {} });
            }

            // authentication and authorization successful
            req.auth!.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.auth!.ownsToken = (token: string) => !!refreshTokens.find((x: TokenObject) => x.token === token);
            next();
        }
    ];
}

export default authorize;

