import express from 'express';
import { SyllabusController } from '../controllers/syllabus.controller';
import { authenticateTeacher } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create', authenticateTeacher, SyllabusController.createSyllabus);
router.get('/get/:id', authenticateTeacher, SyllabusController.getSyllabusById);
router.put('/update/:id', authenticateTeacher, SyllabusController.updateSyllabusById);
router.delete('/delete/:id', authenticateTeacher, SyllabusController.deleteSyllabusById);
router.get('/teacher/:id', authenticateTeacher, SyllabusController.getSyllabusByTeacherId);

export default router;