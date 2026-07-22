import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Handle string-based errors (custom application errors)
    switch (true) {
        case typeof err === 'string':
            const is404 = err.toLowerCase().endsWith('not found');
            const is401 = err.toLowerCase().endsWith('unauthorized');
            const statusCode = is404 ? 404 : is401 ? 401 : 400;  // Set status based on error type
            return res.status(statusCode).json({
                meta: { message: err, status: statusCode },
                data: {}
            });

        // Handle specific error from a JWT authentication library
        case err.name === 'UnauthorizedError':
            return res.status(401).json({
                meta: { message: 'Unauthorized', status: 401 },
                data: {}
            });

        // Default: handle general errors
        default:
            return res.status(500).json({
                meta: { status: 500, message: err.message },
                data: {}
            });
    }
};

export default errorHandler;