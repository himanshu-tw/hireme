import express from 'express'

// controllers
import { getDevProfile, createDevProfile, getOpenJobs, applyToJob, getMyApplications } from "../controllers/developer.controller";
import { authenticate, authorize } from '../middleware/middleware';

const router = express.Router()

router.get("/getDevProfile", authenticate, authorize("DEVELOPER"), getDevProfile)
router.post("/createDevProfile", authenticate, authorize("DEVELOPER"), createDevProfile)
router.get("/getOpenJobs", authenticate, authorize("DEVELOPER"), getOpenJobs)
router.post("/applyToJob", authenticate, authorize("DEVELOPER"), applyToJob)
router.get("/getMyApplications", authenticate, authorize("DEVELOPER"), getMyApplications)

export default router
