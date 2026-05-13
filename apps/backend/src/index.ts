const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth.ts')

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
