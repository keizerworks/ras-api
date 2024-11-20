import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SyllabusController {
    static async createSyllabus(req: any, res: any) {
        try {
            const { title, content } = req.body;

            // Validate input
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }

            // Create syllabus in database
            const syllabus = await prisma.syllabus.create({
                data: {
                    title,
                    content,
                    teacherId: req.teacher.id // From auth middleware
                }
            });

            res.status(201).json({
                message: 'Syllabus created successfully',
                syllabus
            });

        } catch (error) {
            console.error('Create syllabus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getSyllabus(req: any, res: any) {
        try {
            const { id } = req.params;

            const syllabus = await prisma.syllabus.findUnique({
                where: { id }
            });

            if (!syllabus) {
                return res.status(404).json({ error: 'Syllabus not found' });
            }

            res.json({ syllabus });

        } catch (error) {
            console.error('Get syllabus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateSyllabus(req: any, res: any) {
        try {
            const { id } = req.params;
            const { title, content } = req.body;

            // Validate input
            if (!title && !content) {
                return res.status(400).json({ error: 'Title or content is required' });
            }

            const syllabus = await prisma.syllabus.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(content && { content })
                }
            });

            res.json({
                message: 'Syllabus updated successfully',
                syllabus
            });

        } catch (error) {
            console.error('Update syllabus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async deleteSyllabus(req: any, res: any) {
        try {
            const { id } = req.params;

            await prisma.syllabus.delete({
                where: { id }
            });

            res.json({ message: 'Syllabus deleted successfully' });

        } catch (error) {
            console.error('Delete syllabus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getAllSyllabus(req: any, res: any) {
        try {
            const syllabuses = await prisma.syllabus.findMany({
                where: {
                    teacherId: req.teacher.id
                }
            });

            res.json({ syllabuses });

        } catch (error) {
            console.error('Get all syllabus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
