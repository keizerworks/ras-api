import { PrismaClient, TestType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas specific to Prelims exams
const PrelimsQuestionSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  image: z.string().optional(), // Optional base64 image
});

const PrelimsAnswerSchema = z.object({
  correctAnswerIndex: z.number().int().min(0), // Index of the correct answer in the answers array
  reason: z.string().optional(),              // Explanation for why it's correct
});

const SubjectsSchema = z.object({
  subject: z.string(), // The main subject
  subtopics: z.array(z.string()), // Array of subtopics related to the subject
});

const CreatePrelimsExamSchema = z.object({
  title: z.string(),
  type: z.enum(['Free', 'Paid']),
  testType: z.enum(['SECTIONAL', 'MULTI_SECTIONAL', 'FULL_LENGTH']),
  duration: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  questionData: z.array(PrelimsQuestionSchema),
  answerKeyData: z.array(PrelimsAnswerSchema),
  subjects: SubjectsSchema, // Updated to include one subject and an array of subtopics
});

export class PrelimsExamController {
  static async createPrelimsExam(req: any, res: any) {
    try {
      // Validate request body
      const validatedData = CreatePrelimsExamSchema.parse(req.body);
      // Create exam with validated data
      const exam = await prisma.exam.create({
        data: {
          title: validatedData.title,
          type: validatedData.type,
          testType: validatedData.testType,
          duration: validatedData.duration,
          totalMarks: validatedData.totalMarks,
          questionData: validatedData.questionData,
          category: 'Prelims', // Hardcoded since this is specifically for Prelims
          teacherId: req.teacher.id,
          subjects: validatedData.subjects, // Store subjects JSON directly
          prelimsAnswerKey: {
            create: {
              answerKeyData: validatedData.answerKeyData // Store answer key data as JSON
            }
          }
        },
        include: {
          prelimsAnswerKey: true, // Include prelimsAnswerKey in the response
        },
      });

      res.status(201).json({
        message: 'Prelims exam created successfully',
        exam,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      console.error('Error creating prelims exam:', error);
      res.status(500).json({
        error: 'Failed to create prelims exam',
      });
    }
  }

  static async getTeacherPrelimsExams(req: any, res: any) {
    try {
      const exams = await prisma.exam.findMany({
        where: {
          teacherId: req.teacher.id,
          category: 'Prelims',
        },
        include: {
          prelimsAnswerKey: true, // Added this line to include answer keys
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error fetching prelims exams:', error);
      res.status(500).json({
        error: 'Failed to fetch prelims exams',
      });
    }
  }

  static async getPrelimsExamById(req: any, res: any) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: { 
          id,
          category: 'Prelims',
        },
        include: {
          prelimsAnswerKey: true, // Include associated answer key
        },
      });

      if (!exam) {
        return res.status(404).json({
          error: 'Prelims exam not found',
        });
      }

      // Verify teacher owns this exam
      if (exam.teacherId !== req.teacher.id) {
        return res.status(403).json({
          error: 'Not authorized to access this prelims exam',
        });
      }

      res.status(200).json({ exam });
    } catch (error) {
      console.error('Error fetching prelims exam:', error);
      res.status(500).json({
        error: 'Failed to fetch prelims exam',
      });
    }
  }

  static async deletePrelimsExam(req: any, res: any) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: { 
          id,
          category: 'Prelims',
        },
      });

      if (!exam) {
        return res.status(404).json({
          error: 'Prelims exam not found',
        });
      }

      // Verify teacher owns this exam
      if (exam.teacherId !== req.teacher.id) {
        return res.status(403).json({
          error: 'Not authorized to delete this prelims exam',
        });
      }

      await prisma.exam.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Prelims exam deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting prelims exam:', error);
      res.status(500).json({
        error: 'Failed to delete prelims exam',
      });
    }
  }


  static async getFreePrelimsExams(req: any, res: any) {
    try {
      const exams = await prisma.exam.findMany({
        where: {
          type: 'Free',
          category: 'Prelims',
        },
        include: {
          prelimsAnswerKey: true, // Added this line to include answer keys
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(exams)
      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error fetching prelims exams:', error);
      res.status(500).json({
        error: 'Failed to fetch prelims exams',
      });
    }
  }

  static async getFreeAndPaidPrelimsExamsInfo(req: any, res: any) {
    const freeExams = await prisma.exam.findMany({
      where: {
        type: 'Free',
        category: 'Prelims',
      },
      include: {
        prelimsAnswerKey: true, // Added this line to include answer keys
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const paidExams = await prisma.exam.findMany({
      where: {
        type: 'Free',
        category: 'Prelims',
      },
      include: {
        prelimsAnswerKey: true, // Added this line to include answer keys
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ freeExams, paidExams });
  }
}