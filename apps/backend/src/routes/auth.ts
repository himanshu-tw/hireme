import express from 'express'

// controllers
import { register, signIn, me, logout } from "../controllers/auth.controller";
import { authenticate } from '../middleware/middleware';

const router = express.Router()

router.post("/register", register)
router.post("/sign-in", signIn)
router.get("/me", authenticate, me)
router.post("/logout", logout)

export default router
