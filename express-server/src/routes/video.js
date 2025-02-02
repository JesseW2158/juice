import express from 'express';
import { uploadVideo } from '../controllers/videoController.js';

export const router = express.Router();

// Disable body parser for this route as we're using formidable
router.post('/upload', (req, res, next) => {
  uploadVideo(req, res).catch(next);
});

// Add an additional route at the root level
router.post('/', (req, res, next) => {
  uploadVideo(req, res).catch(next);
}); 