import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SyllabusController {
    static async createSyllabus(req: any, res: any) {
        try {
            const { title, content } = req.body;

            // Validate input
            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            // Ensure content is a valid JSON string
            let parsedContent;
            try {
                parsedContent = JSON.stringify(content); // Store the entire JSON content
            } catch (error) {
                return res.status(400).json({ error: 'Invalid content format' });
            }

            // Create syllabus in database
            const syllabus = await prisma.syllabus.create({
                data: {
                    title,
                    content: parsedContent, // Store the content as a JSON string
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

    static async getSyllabusById(req: any, res: any) {
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

    static async getSyllabusByTeacherId(req: any, res: any) {
        try {
            const { teacherId } = req.params;

            const syllabuses = await prisma.syllabus.findMany({
                where: { teacherId }
            });

            if (!syllabuses.length) {
                return res.status(404).json({ error: 'No syllabuses found for this teacher' });
            }

            res.json({ syllabuses });

        } catch (error) {
            console.error('Get syllabus by teacher error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateSyllabusById(req: any, res: any) {
        try {
            const { id } = req.params;
            const { title, content } = req.body;

            // Validate input
            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            // Ensure content is a valid JSON string
            let parsedContent;
            try {
                parsedContent = JSON.stringify(content); // Update the content as JSON
            } catch (error) {
                return res.status(400).json({ error: 'Invalid content format' });
            }

            const syllabus = await prisma.syllabus.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    content: parsedContent // Update the content as JSON
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

    static async deleteSyllabusById(req: any, res: any) {
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
