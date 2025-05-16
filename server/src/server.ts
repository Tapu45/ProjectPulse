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
const port = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5173', '*'],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complain", complainRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/admin", adminRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});