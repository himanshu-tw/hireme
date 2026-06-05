import { db } from "../db";
import { eq } from 'drizzle-orm'
import { Request, Response } from 'express'

import { developerProfiles } from "../db/schema";
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
