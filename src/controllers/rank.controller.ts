import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { deleteRankService, getRanksServices, rankService, updateRankService } from "../services/rank.service";


export const addRankSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        department_id: Joi.string().guid().required(),
        rank_name: Joi.string().required(), 
    });
    validateRequest(req, next, schema)
}

export const addRank = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const data = {
            ...body,
            created_by: req.auth?.id,
        }
        const rank = await rankService(data);
        res.json({
            meta: {
                status: 200,
                message: "Rank added successful"
            },
            data: rank
        });
    } catch (error) {
        next(error);
    }
}

export const getRanks= async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ranks = await getRanksServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: ranks
        })
        
    } catch (error) {
        next(error)
    }
}

export const updateRankSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        department_id: Joi.string().guid().required(),
        rank_name: Joi.string().required(), 
    });
    validateRequest(req, next, schema)
}

export const updateRank = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
                const data = {
            ...body,
            updated_by: req.auth?.id,
        }
        const rank = await updateRankService(data);
        res.json({
            meta: {
                status: 200,
                message: "Rank updated successful"
            },
            data: rank
        });
    } catch (error) {
        next(error);
    }
}


export const deleteRank = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        await deleteRankService(req.params?.id as string)
        res.json({
            meta: {
                status: 200,
                message: "Rank deleted successfully"
            },
            data: {
            }
        })
    } catch (error) {
        next(error)
    }
}
