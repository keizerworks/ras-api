import express from 'express';
import { PrelimsExamController } from '../controllers/exam.prelims.controller';
import { authenticateTeacher } from '../middleware/auth.middleware';
import { MainsExamController } from '../controllers/exam.mains.controller';

const router = express.Router();

router.use(authenticateTeacher);

router.post('/prelims', PrelimsExamController.createPrelimsExam);
router.get('/prelims', PrelimsExamController.getTeacherPrelimsExams);
router.get('/prelims/:id', PrelimsExamController.getPrelimsExamById);
router.delete('/prelims/:id', PrelimsExamController.deletePrelimsExam);

router.post('/mains', MainsExamController.createMainsExam);
router.get('/mains', MainsExamController.getTeacherMainsExams);
router.get('/mains/:id', MainsExamController.getMainsExamById);
router.delete("/mains/:id", MainsExamController.deleteMainsExam);

export default router;