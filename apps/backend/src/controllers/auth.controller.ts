import { db } from '../db/index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/generateToken'
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie'
import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/middleware'

// bullmq
import { emailQueue } from '../queues/email.queue'


export async function verify(req: AuthRequest, res: Response) {
  try {
    const token = req.query.token as string

    if (!token) {
      return res.status(400).json({ message: "token not found" })
    }

    const [user] = await db.select().from(users).where(eq(users.verificationToken, token))

    if (!user) {
      return res.status(400).json({ message: "Invalid token" })
    }

    if (new Date() > user.verificationTokenExpiry!) {
      return res.status(400).json({ message: "Token expired" })
    }

    const [updatedUser] = await db.update(users).set({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    }).where(eq(users.id, user.id)).returning();

    // generate jwt
    const jwtToken = generateToken(user.id, user.role)

    // set cookie
    setAuthCookie(res, jwtToken)

    // role: user.role return
    return res.status(200).json({ role: updatedUser?.role })
  } catch (err) {
    return res.status(500).json({ message: "server error" })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body

    const existing = await db.select().from(users).where(eq(users.email, email))

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verification_token = crypto.randomUUID()

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken: verification_token,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }).returning()

    emailQueue.add('send-email', { type: 'verification', email, token: verification_token })

    return res.status(200).json({ message: "check your email" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password!)
    const isVerifiedUser = user.isVerified;

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    if (!isVerifiedUser) {
      return res.status(400).json({ message: "Please verify your email" })
    }

    const token = generateToken(user.id, user.role)

    setAuthCookie(res, token)
    res.json({ role: user.role })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  res.json({ id: req.user.id, role: req.user.role })
}

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookie(res)
  res.json({ message: 'Logged out' })
}
