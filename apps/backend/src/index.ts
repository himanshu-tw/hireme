import 'dotenv/config'
import express from "express";
import cors from "cors";

import authRouter from './routes/auth';
import developerRouter from './routes/developer'
import companyRouter from './routes/company'

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRouter)

app.use('/api', developerRouter)

app.use('/api/company', companyRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});