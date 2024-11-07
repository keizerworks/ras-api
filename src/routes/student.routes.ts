import express from 'express';
import { signup, signin } from '../controllers/student.controller.js';
import { authenticateStudent } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

// Example protected route
router.get('/profile', authenticateStudent, (req: any, res: any) => {
  res.json({ student: req.student });
});

export default router;