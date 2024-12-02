import express from 'express';
import TodoController from '../controllers/student.todo.controller';

const router = express.Router();

router.post('/create', TodoController.createTodo);
router.get('/get', TodoController.getTodos);
router.put('/update/:id', TodoController.updateTodo);
router.delete('/delete/:id', TodoController.deleteTodo);

export default router;