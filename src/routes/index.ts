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
import { addZone, deleteZone, ZoneSchema, ZoneUpdateSchema, updateZone, getZoneById, getAllZones } from '../controllers/zone.controller';
import { addLGA, deleteLGA, getAllLGAs, getLGAById, LGASchema, LGAUpdateSchema, updateLGA } from '../controllers/lga.controller';
import {
    GroundRentRateSchema,
    GroundRentRateUpdateSchema,
    getAllGroundRentRatesSchema,
    addGroundRentRate,
    updateGroundRentRate,
    getAllGroundRentRates,
    getGroundRentRateById,
    deleteGroundRentRate,
} from "../controllers/groundRentRate.controller";
import { verifyGroundRentYear, VerifyGroundRentYearSchema } from '../controllers/groundRentVerification.controller';
import { getGroundRentHistory } from '../controllers/groundRentHistory.controller';
import { generateGroundRentAssessment, generateGroundRentAssessmentSchema } from '../controllers/groundRentAssessmentGeneration.controller';
import { bulkGenerateGroundRentAssessments, bulkGenerateGroundRentAssessmentsSchema } from '../controllers/bulkGroundRentAssessmentGeneration.controller';
import { previewBulkGroundRentAssessments, BulkGroundRentAssessmentPreviewSchema } from '../controllers/bulkGroundRentAssessmentPreview.controller';

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

// Zone
router.post('/zone', authorize(Roles.admin), ZoneSchema, addZone);
router.put('/zone', authorize(Roles.admin), ZoneUpdateSchema, updateZone);
router.get('/zone', authorize(), getAllZones);
router.get('/zone/:zone_id', authorize(), getZoneById);
router.delete('/zone/:id', authorize(Roles.admin), deleteZone);

//LGA
router.post('/lga', authorize(Roles.admin), LGASchema, addLGA)
router.put('/lga', authorize(Roles.admin), LGAUpdateSchema, updateLGA);
router.get('/lga', authorize(), getAllLGAs);
router.get('/lga/:lga_id', authorize(), getLGAById);
router.delete('/lga/:id', authorize(Roles.admin), deleteLGA)

// Ground Rent Rate
router.post('/ground-rent-rate', authorize(Roles.admin), GroundRentRateSchema, addGroundRentRate);
router.put('/ground-rent-rate', authorize(Roles.admin), GroundRentRateUpdateSchema, updateGroundRentRate);
router.get('/ground-rent-rate', authorize(), getAllGroundRentRatesSchema, getAllGroundRentRates);
router.get('/ground-rent-rate/:rate_id', authorize(), getGroundRentRateById);
router.delete('/ground-rent-rate/:rate_id', authorize(Roles.admin), deleteGroundRentRate);
router.post('/verify-ground-rent', authorize(Roles.admin), VerifyGroundRentYearSchema, verifyGroundRentYear);
router.get('/ground-rent-history/:fileId', authorize(), getGroundRentHistory);
router.post(
  "/assessments/generate",
  authorize(), 
  generateGroundRentAssessmentSchema,
  generateGroundRentAssessment
);
router.post(
  "/assessments/generate/bulk",
  authorize(),
  bulkGenerateGroundRentAssessmentsSchema,
  bulkGenerateGroundRentAssessments,
);

router.post(
  "/assessments/preview/bulk",
  authenticate,
  BulkGroundRentAssessmentPreviewSchema,
  previewBulkGroundRentAssessments
);




export default router
