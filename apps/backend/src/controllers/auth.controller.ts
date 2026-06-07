import { db } from '../db/index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/generateToken'
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie'
import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/middleware'

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body

    const existing = await db.select().from(users).where(eq(users.email, email))

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      role,
    }).returning()

    // generate verification token and send verification email here (omitted for brevity)
    const token = generateToken(newUser!.id, newUser!.role)

    setAuthCookie(res, token)
    res.json({ role: newUser!.role })

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

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
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
