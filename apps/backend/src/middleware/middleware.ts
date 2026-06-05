import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string, role: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return res.status(400).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = decoded as { id: string, role: string }
        next()
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' })
    }
}

export const authorize = (role: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(400).json({ message: 'Unauthorized' })
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        next()
    }
}