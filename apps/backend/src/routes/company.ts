import express from 'express'

// controllers
import { getCompanyProfile, createCompanyProfile, createJob, getCompanyJobs, updateJob, updateJobStatus } from "../controllers/company.controller";
import { authenticate, authorize } from '../middleware/middleware';

const router = express.Router()

router.get("/profile", authenticate, authorize("COMPANY"), getCompanyProfile)
router.post("/profile", authenticate, authorize("COMPANY"), createCompanyProfile)
router.post("/jobs", authenticate, authorize("COMPANY"), createJob)
router.get("/jobs", authenticate, authorize("COMPANY"), getCompanyJobs)
router.put("/jobs/:jobId", authenticate, authorize("COMPANY"), updateJob)
router.patch("/job/:jobId/status", authenticate, authorize("COMPANY"), updateJobStatus)

export default router