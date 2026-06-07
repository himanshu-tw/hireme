import 'dotenv/config'
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from './routes/auth';
import developerRouter from './routes/developer'
import companyRouter from './routes/company'

import './worker/email.worker';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRouter)

app.use('/api', developerRouter)

app.use('/api/company', companyRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});