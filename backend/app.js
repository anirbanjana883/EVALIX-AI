import express from 'express';
import cors from 'cors'; // 👈 Add this

import { requireAuth } from './src/middlewares/auth.middleware.js';
import submitRoutes from './src/routes/submit.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api', uploadRoutes); // Creates: POST /api/upload
app.use('/api', submitRoutes); // Creates: POST /api/submit
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teacher', teacherRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "Operational", 
    architecture: "CSR Pattern Active",
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;