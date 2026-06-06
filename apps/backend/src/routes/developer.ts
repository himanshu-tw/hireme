import express from 'express'

// controllers
import { getDevProfile, createDevProfile, getOpenJobs, applyToJob, getMyApplications } from "../controllers/developer.controller";
import { authenticate, authorize } from '../middleware/middleware';

const router = express.Router()

router.get("/developer/profile", authenticate, authorize("DEVELOPER"), getDevProfile)
router.post("/developer/profile", authenticate, authorize("DEVELOPER"), createDevProfile)
router.get("/jobs", authenticate, authorize("DEVELOPER"), getOpenJobs)
router.post("/jobs/:jobId/apply", authenticate, authorize("DEVELOPER"), applyToJob)
router.get("/applications", authenticate, authorize("DEVELOPER"), getMyApplications)

export default router
