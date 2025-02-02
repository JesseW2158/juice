import dotenv from 'dotenv';
// Load environment variables before other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router as videoRouter } from './routes/video.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/video', videoRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 