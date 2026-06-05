import express from 'express'

// controllers
import { register, signIn } from "../controllers/auth.controller";

const router = express.Router()

router.post("/register", register)
router.post("/sign-in", signIn)

export default router
