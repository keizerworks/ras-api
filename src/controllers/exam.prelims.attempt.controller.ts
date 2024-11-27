import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrelimsAttemptController {
    static async submitPrelimsScore(req: any, res: any) {
        try {
            const { examId, score, accuracy, attempts } = req.body;
            const studentId = req.student.id; // From auth middleware

            // Validate input
            if (!examId || score === undefined || accuracy === undefined || attempts === undefined) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Create attempt in database
            const attempt = await prisma.prelimsAttempt.create({
                data: {
                    studentId,
                    examId,
                    score,
                    accuracy,
                    attempts
                }
            });

            res.status(201).json({
                message: 'Score submitted successfully',
                attempt
            });

        } catch (error) {
            console.error('Submit prelims score error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getStudentPrelimsScores(req: any, res: any) {
        try {
            const studentId = req.student.id; // From auth middleware

            const attempts = await prisma.prelimsAttempt.findMany({
                where: { studentId },
                include: {
                    exam: {
                        select: {
                            title: true,
                            totalMarks: true
                        }
                    }
                },
                orderBy: {
                    attemptDate: 'desc'
                }
            });

            res.json({ attempts });

        } catch (error) {
            console.error('Get student scores error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async updateStudentStreak(req: any, res: any) {
        try {
            const studentId = req.student.id; // From auth middleware
            const now = new Date();

            // Get or create streak
            let streak = await prisma.studentStreak.findUnique({
                where: { studentId }
            });

            if (!streak) {
                streak = await prisma.studentStreak.create({
                    data: {
                        studentId,
                        streakCount: 1,
                        lastVisit: now
                    }
                });
            } else {
                // Check if last visit was yesterday
                const lastVisit = new Date(streak.lastVisit);
                const dayDifference = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

                if (dayDifference === 1) {
                    // Increment streak if last visit was yesterday
                    streak = await prisma.studentStreak.update({
                        where: { studentId },
                        data: {
                            streakCount: streak.streakCount + 1,
                            lastVisit: now
                        }
                    });
                } else if (dayDifference > 1) {
                    // Reset streak if more than a day has passed
                    streak = await prisma.studentStreak.update({
                        where: { studentId },
                        data: {
                            streakCount: 1,
                            lastVisit: now
                        }
                    });
                } else if (dayDifference === 0) {
                    // Just update last visit time if same day
                    streak = await prisma.studentStreak.update({
                        where: { studentId },
                        data: {
                            lastVisit: now
                        }
                    });
                }
            }

            res.json({ streak });

        } catch (error) {
            console.error('Update streak error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getStudentStreak(req: any, res: any) {
        try {
            const studentId = req.student.id; // From auth middleware

            const streak = await prisma.studentStreak.findUnique({
                where: { studentId }
            });

            if (!streak) {
                return res.json({ streak: { streakCount: 0 } });
            }

            res.json({ streak });

        } catch (error) {
            console.error('Get streak error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 