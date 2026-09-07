import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import authorize from '../middlewares/authorize';
import fileExtLimiter from '../middlewares/fileExtLimiter';
import filesPayloadExists from '../middlewares/filePayloadExists';
import fileSizeLimiter from '../middlewares/fileSizeLimiter';
import { FileSchema, File, getFiles, updateFileSchema, updateFile, deleteFile } from '../controllers/file.controller';
import { deleteDepartment, Department, DepartmentSchema, getDepartments, getDepartmentsAndRanks, updateDepartment, updateDepartmentSchema } from '../controllers/department.controller';
import { addRank, addRankSchema, deleteRank, getRanks, updateRank, updateRankSchema } from '../controllers/rank.controller';
import { Account, AccountSchema, authenticate, authenticateSchema, changePassword, changePasswordSchema, deleteAccount, forgotPassword, forgotPasswordSchema, getUsers, refreshToken, resetPassword, resetPasswordSchema, revokeToken, revokeTokenSchema, updateAccount, updateAccountSchema, updateUser, updateUserSchema, verifyEmail, verifyEmailSchema } from '../controllers/account.controller';
import { Roles } from '../utils/roles';
import { getDashboardFilesCountsbyUser, getDashboardGraph, getDashboardStats } from '../controllers/dashboard.controller';
import { addLanduse, addLanduseSchema, addPurpose, addPurposeSchema, deletePurpose, getLanduse, getLanduseAndPurpose, getPurposes, updatePurpose, updatePurposeSchema } from '../controllers/landuse.controller';


const router = express.Router();


// account management
router.post('/account', authorize(Roles.admin), AccountSchema, Account);
router.delete('/account/:id', authorize(Roles.admin), deleteAccount)
router.put("/account", authorize(Roles.admin), updateAccountSchema, updateAccount)
router.get('/users', authorize(), getUsers);
router.get('/files-counts-by-user', authorize(), getDashboardFilesCountsbyUser);
router.put('/user',
  authorize(),
  fileUpload({ createParentPath: true, useTempFiles: false }),
  updateUserSchema,
  // filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg", ".PNG", ".webp"]),
  fileSizeLimiter,
  updateUser);


// auths
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.put('/change-password', authorize(), changePasswordSchema,changePassword);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/reset-password', resetPasswordSchema, resetPassword);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/refresh-token', refreshToken);


// departments and ranks
router.post('/department', authorize(Roles.admin), DepartmentSchema, Department);
router.put('/department', authorize(Roles.admin), updateDepartmentSchema, updateDepartment);
router.get('/departments_ranks', authorize(), getDepartmentsAndRanks)
router.delete('/department/:id', authorize(Roles.admin), deleteDepartment);
router.get('/departments', authorize(), getDepartments);
router.post("/rank", authorize(Roles.admin), addRankSchema, addRank);
router.put('/rank', authorize(Roles.admin), updateRankSchema, updateRank)
router.get('/ranks', getRanks)
router.delete('/rank/:id', authorize(Roles.admin), deleteRank);


// land and purpose
router.get('/landuses_purposes', authorize(), getLanduseAndPurpose)
router.post('/landuse', authorize(), addLanduseSchema, addLanduse);
router.get("/landuse", authorize(), getLanduse);
router.post("/purpose", authorize(), addPurposeSchema, addPurpose);
router.put("/purpose", authorize(), updatePurposeSchema, updatePurpose);
router.get("/purpose", authorize(), getPurposes);
router.delete('/purpose/:id', authorize(Roles.admin), deletePurpose);


// files and records
router.post('/file', authorize(), FileSchema, File);
router.get('/files', authorize(), getFiles);
router.put("/file", authorize(), updateFileSchema, updateFile);
router.delete('/file/:id', authorize(Roles.admin), deleteFile);


// Dashboard
router.get("/dashboard/stats", authorize(), getDashboardStats);
router.get("/dashboard/graph", authorize(), getDashboardGraph);


export default router