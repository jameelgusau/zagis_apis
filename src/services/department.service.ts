import { Op } from "sequelize";
import { db } from "../db";

interface fileAttributes {
    department_name: string;

}

interface Extern extends fileAttributes {
    id: string;
    updated_by: string;
}

export const departmentService = async (params: fileAttributes) => {
    const findFile = await db.Department.findOne({
        where: {
            department_name: {
                [Op.iLike]: params.department_name
            }
        }
    })
    if (findFile) throw "Department already exist"
    const createDepartment = new db.Department(params);
    await createDepartment.save()
}


export const getDepartmentsServices = async () => {
    const departments = await db.Department.findAll({
        order: [['department_name', 'ASC']]
    });
    return departments
}

export const getDepartmentsAndRanksServices = async () => {
    const departments = await db.Department.findAll({
        order: [['department_name', 'ASC']],
        include: [{
            model: db.Rank,
            as: "ranks"
        }],
        
    });
    return departments
}

export const updateDepartmentService = async (params: Extern) => {
    const { department_name, id, updated_by } = params
    const findFile = await db.Department.findOne({
        where: {
            department_name: {
                [Op.iLike]: params.department_name
            }
        }
    })
    if (findFile && findFile.id !== params.id) throw "Department already exist"
    try {
        await db.Department.update(
            {
                department_name,
                updated_by
            },
            { where: { id } }
        );

    } catch (error) {
        throw error;
    }
}

export const deleteDepartmentService = async (id: string) => {
    const file = await getDepartment(id);
    await file.destroy()
}

export const getDepartment = async (id: string) => {
    const file = await db.Department.findByPk(id);
    if (!file) throw 'File not found';
    return file;
}