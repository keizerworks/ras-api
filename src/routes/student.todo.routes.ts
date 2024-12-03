import express from 'express';
import TodoController from '../controllers/student.todo.controller';
import { authenticateStudent } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create', authenticateStudent, TodoController.createTodo);
router.get('/get', authenticateStudent, TodoController.getTodos);
router.put('/update/:id', authenticateStudent, TodoController.updateTodo);
router.delete('/delete/:id', authenticateStudent, TodoController.deleteTodo);

export default router;