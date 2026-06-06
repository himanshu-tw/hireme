import { db } from "../db";
import { companyProfiles, jobs } from "../db/schema";
import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { eq, and } from "drizzle-orm";

export const getCompanyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const profile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (profile.length === 0) {
            return res.status(404).json({ message: "profile not found" })
        }

        return res.json({ profile: profile[0] });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const createCompanyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, websiteUrl, location } = req.body;

        if (!name || !description || !websiteUrl || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const existingProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (existingProfile.length > 0) {
            return res.status(400).json({ message: "Profile already exists" })
        }

        const [profile] = await db.insert(companyProfiles).values({
            userId: id,
            name,
            description,
            website: websiteUrl,
            location
        }).returning();

        return res.json({ profile });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, skills, location, salary, status } = req.body;

        if (!title || !description || !skills || !location || !salary || !status) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const companyProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (companyProfile.length === 0) {
            return res.status(404).json({ message: "Company profile not found" })
        }

        const [job] = await db.insert(jobs).values({
            companyId: companyProfile[0]!.id,
            title,
            description,
            skills,
            location,
            salary,
            status
        }).returning();

        return res.json({ job });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const getCompanyJobs = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const companyProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (companyProfile.length === 0) {
            return res.status(404).json({ message: "Company profile not found" })
        }

        const jobsList = await db.select().from(jobs).where(eq(jobs.companyId, companyProfile[0]!.id));

        return res.json({ jobs: jobsList });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const updateJob = async (req: AuthRequest, res: Response) => {
    try {
        const jobIdParam = req.params.jobId;
        const { title, description, skills, location, salary, status } = req.body;

        if (!jobIdParam || Array.isArray(jobIdParam)) {
            return res.status(400).json({ message: "jobId param is required" })
        }

        const jobId = jobIdParam;

        if (!title || !description || !skills || !location || !salary || !status) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const companyProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (companyProfile.length === 0) {
            return res.status(404).json({ message: "Company profile not found" })
        }

        const jobExists = await db.select().from(jobs).where(eq(jobs.id, jobId));

        if (jobExists.length === 0) {
            return res.status(404).json({ message: "Job not found" })
        }

        const [job] = await db.update(jobs).set({
            title,
            description,
            skills,
            location,
            salary,
            status
        }).where(eq(jobs.id, jobId)).returning();

        return res.json({ job });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const updateJobStatus = async (req: AuthRequest, res: Response) => {
    try {
        const jobIdParam = req.params.jobId;
        const { status } = req.body;

        if (!jobIdParam || Array.isArray(jobIdParam)) {
            return res.status(400).json({ message: "jobId param is required" })
        }

        const jobId = jobIdParam;

        if (!status) {
            return res.status(400).json({ message: "Status is required" })
        }

        const id = req.user?.id;

        if (!id) {
            return res.status(400).json({ message: "id not found" })
        }

        const companyProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, id));

        if (companyProfile.length === 0) {
            return res.status(404).json({ message: "Company profile not found" })
        }

        const job = await db.update(jobs).set({ status }).where(and(eq(jobs.id, jobId), eq(jobs.companyId, companyProfile[0]!.id))).returning();

        if (job.length === 0) {
            return res.status(404).json({ message: "Job not found" })
        }

        return res.json({ job: job[0] });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}