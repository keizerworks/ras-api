import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


class TodoController {
    static async createTodo(req: any, res: any) {
        try {
            const { title, description } = req.body;
            const studentId = req.student.id; // From auth middleware

            const newTodo = await prisma.todo.create({
                data: {
                    title,
                    description,
                    studentId,
                },
            });

            res.status(201).json(newTodo);
        } catch (error) {
            console.error('Create Todo error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getTodos(req: any, res: any) {
        try {
            const studentId = req.student.id; // From auth middleware

            const todos = await prisma.todo.findMany({
                where: { studentId },
            });

            res.json(todos);
        } catch (error) {
            console.error('Get Todos error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateTodo(req: any, res: any) {
        try {
            const { id } = req.params;
            const { title, description, completed } = req.body;
            const studentId = req.student.id; // From auth middleware

            const updatedTodo = await prisma.todo.update({
                where: { id, studentId },
                data: {
                    title,
                    description,
                    completed,
                },
            });

            res.json(updatedTodo);
        } catch (error) {
            console.error('Update Todo error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteTodo(req: any, res: any) {
        try {
            const { id } = req.params;
            const studentId = req.student.id; // From auth middleware

            await prisma.todo.delete({
                where: { id, studentId },
            });

            res.status(204).send();
        } catch (error) {
            console.error('Delete Todo error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default TodoController;
