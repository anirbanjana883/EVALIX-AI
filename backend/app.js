import express from 'express';
import cors from 'cors';

// Import Routes
import { requireAuth } from './src/middlewares/auth.middleware.js';
import submitRoutes from './src/routes/submit.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';
import userRoutes from './src/routes/user.routes.js';

const app = express();

// ============================================================================
// 🌟 STRICT CORS CONFIGURATION
// ============================================================================
const allowedOrigins = [
  'http://localhost:5173', // For local development
  process.env.FRONTEND_URL // For your deployed production frontend (Render/Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, curl, or mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if the incoming request's origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Crucial for passing auth headers/JWT tokens securely
}));

// Global Middleware
app.use(express.json());

// ============================================================================
// 🚦 MOUNT ROUTES
// ============================================================================
app.use('/api', uploadRoutes); // Creates: POST /api/upload
app.use('/api', submitRoutes); // Creates: POST /api/submit
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/user', userRoutes);

// ============================================================================
// 🩺 HEALTH CHECK & ERROR HANDLING
// ============================================================================
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