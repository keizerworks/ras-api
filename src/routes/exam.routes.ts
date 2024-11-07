import express from 'express';
import { PrelimsExamController } from '../controllers/exam.prelims.controller';
import { authenticateTeacher, authenticateStudent } from '../middleware/auth.middleware';
import { MainsExamController } from '../controllers/exam.mains.controller';

const router = express.Router();

router.get('/prelims/free', PrelimsExamController.getFreePrelimsExams);
router.get('/prelims/free-and-paid-info', PrelimsExamController.getFreeAndPaidPrelimsExamsInfo);
router.post('/prelims', authenticateTeacher, PrelimsExamController.createPrelimsExam);
router.get('/prelims', authenticateTeacher, PrelimsExamController.getTeacherPrelimsExams);
router.get('/prelims/:id', authenticateTeacher, PrelimsExamController.getPrelimsExamById);
router.delete('/prelims/:id', authenticateTeacher, PrelimsExamController.deletePrelimsExam);

router.get('/mains/free', MainsExamController.getFreeMainsExams);
router.post('/mains', authenticateTeacher, MainsExamController.createMainsExam);
router.get('/mains', authenticateTeacher, MainsExamController.getTeacherMainsExams);
router.get('/mains/:id', authenticateTeacher, MainsExamController.getMainsExamById);
router.delete("/mains/:id", authenticateTeacher, MainsExamController.deleteMainsExam);


export default router;