import express, { Request, NextFunction } from 'express';
import { ObjectSchema, ArraySchema } from 'joi';

function validateRequest(req: Request, next: NextFunction, schema: ObjectSchema | ArraySchema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

    if (!req.body) req.body = {};
    const { error, value } = schema.validate(req.body, options);
    if (error) {
     
        next(new Error(`Validation error: ${error.details.map(x => x.message).join(', ')}`));

    } else {
        req.body = value;
        next();
    }
}
export default validateRequest; 