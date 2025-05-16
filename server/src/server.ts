import express from 'express';
import cors from 'cors';
import authRoutes from './router/auth.route';
import complainRoutes from './router/issue.route';
import dashboardRoutes from './router/dashboard.route';
import notificationRoutes from './router/notification.route';
import projectRoutes from './router/project.route';
import assignmentRoutes from './router/assignment.route';
import adminRoutes from './router/admin.route'; 

const app = express();
const port = process.env.PORT || 3000;

// Get allowed origins from environment or use defaults
const allowedOrigins = [
  'http://localhost:5174', 
  'http://localhost:5173', 
  'http://127.0.0.1:5174', 
  'http://127.0.0.1:5173',
  'https://project-pulse-nine.vercel.app', // Your production frontend URL
  // Add any other domains that need access
];

// Enable CORS for specific routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complain", complainRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/admin", adminRoutes);

// Add a health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});