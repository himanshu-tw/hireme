import jwt from 'jsonwebtoken'

export function generateToken(userId: string): string {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}