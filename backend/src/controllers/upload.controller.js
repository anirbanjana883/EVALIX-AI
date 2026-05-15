// src/controllers/upload.controller.js
import { StorageService } from '../services/storage.service.js';

export const UploadController = {
  async handleFileUpload(req, res) {
    try {
      const files = req.files; // 🌟 FIX: Now reading .files (array) instead of .file

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided. Please upload images or PDFs." });
      }

      // 🌟 FIX: Upload multiple files concurrently to Supabase
      const uploadPromises = files.map(file => 
        StorageService.uploadExamPaper(
          file.buffer, 
          file.originalname, 
          file.mimetype
        )
      );

      const fileUrls = await Promise.all(uploadPromises);

      // Return an array of URLs to the frontend
      return res.status(200).json({
        message: "Files uploaded successfully",
        fileUrls: fileUrls // e.g., ["https://.../page1.jpg", "https://.../page2.jpg"]
      });

    } catch (error) {
      console.error("[Controller] Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload files to storage" });
    }
  }
};