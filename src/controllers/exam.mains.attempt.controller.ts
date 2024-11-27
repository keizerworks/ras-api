import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { promisify } from "util";

const prisma = new PrismaClient();

// S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

// Multer configuration for PDF files
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req: any, file: any, cb: any) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

const uploadMiddleware = promisify(upload.single("file"));

export class MainsAttemptController {
    private static async uploadFileToS3(file: Express.Multer.File): Promise<string> {
        const fileName = `mains-attempts/${Date.now()}-${file.originalname}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME || "rasdb",
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        return `https://rasdb.s3.ap-south-1.amazonaws.com/${fileName}`;
    }

    static async submitMainsAttempt(req: any, res: any) {
        try {
            await uploadMiddleware(req, res);
            const { examId } = req.body;
            const studentId = req.student.id;

            if (!req.file) {
                return res.status(400).json({
                    error: "No file uploaded",
                });
            }

            // Upload answer sheet to S3
            const answerSheetUrl = await MainsAttemptController.uploadFileToS3(req.file);

            // Create attempt in database
            const attempt = await prisma.mainsAttempt.create({
                data: {
                    studentId,
                    examId,
                    answerSheetUrl,
                    score: 0, // Initial score before teacher evaluation
                    feedback: "", // Initial empty feedback
                },
            });

            res.status(201).json({
                message: "Mains exam attempt submitted successfully",
                attempt,
            });
        } catch (error) {
            console.error("Error submitting mains attempt:", error);
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    error: "File upload error",
                    details: error.message,
                });
            }
            res.status(500).json({
                error: "Failed to submit mains attempt",
            });
        }
    }

    static async getTeacherPendingAttempts(req: any, res: any) {
        try {
            const teacherId = req.teacher.id;

            const attempts = await prisma.mainsAttempt.findMany({
                where: {
                    exam: {
                        teacherId,
                    },
                    feedback: "", // Empty feedback means pending evaluation
                },
                include: {
                    student: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    exam: {
                        select: {
                            title: true,
                            totalMarks: true,
                        },
                    },
                },
                orderBy: {
                    attemptDate: "desc",
                },
            });

            res.json({ attempts });
        } catch (error) {
            console.error("Error fetching pending attempts:", error);
            res.status(500).json({
                error: "Failed to fetch pending attempts",
            });
        }
    }

    static async evaluateAttempt(req: any, res: any) {
        try {
            await uploadMiddleware(req, res);
            const { attemptId, score } = req.body;
            const teacherId = req.teacher.id;

            // Verify teacher owns the exam
            const attempt = await prisma.mainsAttempt.findUnique({
                where: { id: attemptId },
                include: {
                    exam: true,
                },
            });

            if (!attempt) {
                return res.status(404).json({
                    error: "Attempt not found",
                });
            }

            if (attempt.exam.teacherId !== teacherId) {
                return res.status(403).json({
                    error: "Not authorized to evaluate this attempt",
                });
            }

            let evaluatedAnswerSheetUrl = attempt.answerSheetUrl;
            if (req.file) {
                // Upload evaluated answer sheet to S3
                evaluatedAnswerSheetUrl = await MainsAttemptController.uploadFileToS3(req.file);
            }

            // Update attempt with evaluation
            const updatedAttempt = await prisma.mainsAttempt.update({
                where: { id: attemptId },
                data: {
                    score: parseInt(score),
                    answerSheetUrl: evaluatedAnswerSheetUrl,
                    feedback: "Evaluated", // Mark as evaluated
                },
                include: {
                    student: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    exam: {
                        select: {
                            title: true,
                            totalMarks: true,
                        },
                    },
                },
            });

            res.json({
                message: "Attempt evaluated successfully",
                attempt: updatedAttempt,
            });
        } catch (error) {
            console.error("Error evaluating attempt:", error);
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    error: "File upload error",
                    details: error.message,
                });
            }
            res.status(500).json({
                error: "Failed to evaluate attempt",
            });
        }
    }

    static async getStudentAttempts(req: any, res: any) {
        try {
            const studentId = req.student.id;

            const attempts = await prisma.mainsAttempt.findMany({
                where: {
                    studentId,
                },
                include: {
                    exam: {
                        select: {
                            title: true,
                            totalMarks: true,
                        },
                    },
                },
                orderBy: {
                    attemptDate: "desc",
                },
            });

            res.json({ attempts });
        } catch (error) {
            console.error("Error fetching student attempts:", error);
            res.status(500).json({
                error: "Failed to fetch attempts",
            });
        }
    }
} 