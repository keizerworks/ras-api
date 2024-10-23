import express from 'express';
import { signup, signin } from '../controllers/teacher.controller.js';
import { authenticateTeacher } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

// Example protected route
router.get('/profile', authenticateTeacher, (req: any, res: any) => {
  res.json({ teacher: req.teacher });
});

export default router;