import express, { Request, Response } from 'express';
const router = express.Router();
import { streamImages } from '../controllers/account.controller';

router.get("/:folder/:file", streamImages)
export default router