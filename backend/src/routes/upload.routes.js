// src/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
// import { requireStudent } from '../middlewares/role.middleware.js'; // Optional

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🌟 FIX: Use upload.array() and expect the field name 'examFiles' (up to 5 images)
router.post('/upload', requireAuth, upload.array('examFiles', 5), UploadController.handleFileUpload);

export default router;