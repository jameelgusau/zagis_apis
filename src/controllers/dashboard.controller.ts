import { Request, Response, NextFunction } from "express";
import { getDashboardStatsService,getDashboardFilesCountsbyUserService, getDashboardGraphService } from "../services/dashboard.service";




export const getDashboardStats = async (req:Request, res:Response, next: NextFunction) => {
  try {
    const data = await getDashboardStatsService();

    res.json({
      meta: {
        status: 200,
        message: "Dashboard stats fetched"
      },
      data
    });

  } catch (error) {
    next(error);
  }
};

export const getDashboardFilesCountsbyUser = async (req:Request, res:Response, next: NextFunction) => {
  try {
    const data = await getDashboardFilesCountsbyUserService();

    res.json({
      meta: {
        status: 200,
        message: "Dashboard files counts by user fetched"
      },
      data
    });

  } catch (error) {
    next(error);
  }
};

export const getDashboardGraph = async (req:Request, res:Response, next: NextFunction) => {
  try {
    const data = await getDashboardGraphService();

    res.json({
      meta: {
        status: 200,
        message: "Dashboard graph fetched"
      },
      data
    });

  } catch (error) {
    next(error);
  }
};