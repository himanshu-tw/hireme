const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRouter = require('./routes/auth.ts')

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// port
const PORT = process.env.PORT || 5000;


// routers
app.use('/api/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
