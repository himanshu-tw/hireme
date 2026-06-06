import { db } from "../db";
import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'

import { developerProfiles, jobs, applications } from "../db/schema";
import { AuthRequest } from "../middleware/middleware";

export const getDevProfile = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;

    if (!id) {
      return res.status(400).json({ message: "id not found" })
    }

    const profile = await db.select().from(developerProfiles).where(eq(developerProfiles.userId, id));

    if (profile.length === 0) {
      return res.status(404).json({ message: "profile not found" })
    }

    return res.json({ profile: profile[0] });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createDevProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, skills, resumeUrl} = req.body;

      if (!name || !bio || !skills || !resumeUrl) {
        return res.status(400).json({ message: "All fields are required" })
      }

      const id = req.user?.id;

      if (!id) {
        return res.status(400).json({ message: "id not found" })
      }

      const existingProfile = await db.select().from(developerProfiles).where(eq(developerProfiles.userId, id));

      if (existingProfile.length > 0) {
        return res.status(400).json({ message: "Profile already exists" })
      }

      const [profile] = await db.insert(developerProfiles).values({
        userId: id,
        name,
        bio,
        skills,
        resumeUrl
      }).returning();

      return res.json({ profile });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getOpenJobs = async (req: AuthRequest, res: Response) => {
  try {
    const openJobs = await db.select().from(jobs).where(eq(jobs.status, "OPEN"));

    return res.json({ jobs: openJobs });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const applyToJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobIdParam = req.params.jobId;

    if (!jobIdParam || Array.isArray(jobIdParam)) {
      return res.status(400).json({ message: "jobId is required" })
    }

    const jobId = jobIdParam;

    const id = req.user?.id;

    if (!id) {
      return res.status(400).json({ message: "id not found" })
    }

    // Check if job exists and is open
    const jobExists = await db.select().from(jobs).where(eq(jobs.id, jobId));
    const job = jobExists.filter(j => j.status === "OPEN");

    if (job.length === 0) {
      return res.status(404).json({ message: "Job not found or not open" })
    }

    // Check if developer profile exists
    const profile = await db.select().from(developerProfiles).where(eq(developerProfiles.userId, id));

    if (profile.length === 0) {
      return res.status(404).json({ message: "Developer profile not found" })
    }
    
    const devProfile = profile[0]!;

    // Check if already applied
    const existingApplication = await db.select().from(applications).where(eq(applications.jobId, jobId));
    const alreadyApplied = existingApplication.filter(app => app.developerId === devProfile.id);

    if (alreadyApplied.length > 0) {
      return res.status(400).json({ message: "Already applied to this job" })
    }


    // Create application
    await db.insert(applications).values({
      jobId,
      developerId: devProfile.id,
      status: "APPLIED"
    });

    return res.json({ message: "Application submitted" });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;

    if (!id) {
      return res.status(400).json({ message: "id not found" })
    }

    // Check if developer profile exists
    const profile = await db.select().from(developerProfiles).where(eq(developerProfiles.userId, id));

    if (profile.length === 0) {
      return res.status(404).json({ message: "Developer profile not found" })
    }
    
    const devProfile = profile[0]!;

    const myApplications = await db.select().from(applications).where(eq(applications.developerId, devProfile.id));

    return res.json({ applications: myApplications });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}