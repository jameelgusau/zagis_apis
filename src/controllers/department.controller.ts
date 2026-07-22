import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import fs from 'fs';
import { Request as JWTRequest } from "express-jwt";
import validateRequest from "../middlewares/validate-request";
import { deleteDepartmentService, departmentService, getDepartmentsServices, updateDepartmentService, getDepartmentsAndRanksServices } from "../services/department.service";


export const DepartmentSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        department_name: Joi.string().required(),
    });
    validateRequest(req, next, schema)
}

export const Department = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const created_by = req?.auth?.id;
        const data = {
            ...body,
            created_by,
        }
        const department = await departmentService(data);
        res.json({
            meta: {
                status: 200,
                message: "Department added successful"
            },
            data: department
        });
    } catch (error) {
        next(error);
    }
}

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await getDepartmentsServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: departments
        })

    } catch (error) {
        next(error)
    }
}

export const getDepartmentsAndRanks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await getDepartmentsAndRanksServices()
        res.json({
            meta: {
                status: 200,
                message: ""
            },
            data: departments
        })

    } catch (error) {
        next(error)
    }
}

export const updateDepartmentSchema = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        id: Joi.string().guid().required(),
        department_name: Joi.string().required(),
    });
    validateRequest(req, next, schema)
}


export const updateDepartment = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
        const { body } = req
        const updated_by = req?.auth?.id;
        const data = {
            ...body,
            updated_by
        }
        const account = await updateDepartmentService(data);
        res.json({
            meta: {
                status: 200,
                message: "Department updated successful"
            },
            data: account
        });
    } catch (error) {
        next(error);
    }
}

export const deleteDepartment = async (req: JWTRequest, res: Response, next: NextFunction) => {

    try {
        await deleteDepartmentService(req.params?.id as string)
        res.json({
            meta: {
                status: 200,
                message: "File deleted successfully"
            },
            data: {

            }
        })
    } catch (error) {
        next(error)
    }
}
