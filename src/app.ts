import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import teacherRoutes from './routes/teacher.routes.js';
import examRoutes from './routes/exam.routes.js';
import studentRoutes from './routes/student.routes.js';
import syllabusRoutes from './routes/syllabus.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teacher', teacherRoutes);
app.use('/api/exam', examRoutes)
app.use('/api/student', studentRoutes);
app.use('/api/syllabus', syllabusRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the RAS-API' });
});

console.log(process.version);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});