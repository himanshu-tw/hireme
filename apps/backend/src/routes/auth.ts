const express = require('express')

// controllers
const { register, signIn } = require("../controllers/auth.controller");

const router = express.Router()

router.post("/register", register)
router.post("/sign-in", signIn)

module.exports = router
