import express from 'express';
import { SyllabusController } from '../controllers/syllabus.controller';
import { authenticateTeacher } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create', authenticateTeacher, SyllabusController.createSyllabus);

export default router;