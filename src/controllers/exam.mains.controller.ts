import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  //@ts-ignore
  fileFilter: (_req, file, cb) => {
    // Accept only PDF and PPT files
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and PPT files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const uploadMiddleware = promisify(upload.single("file"));

// Validation schema for creating mains exam
const CreateMainsExamSchema = z.object({
  title: z.string(),
  type: z.enum(["Free", "Paid"]),
  duration: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
});

export class MainsExamController {
  private static async uploadFileToS3(
    file: Express.Multer.File
  ): Promise<string> {
    const fileName = `mains-exams/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "rasdb",
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      //throw new Error("Failed to upload file to S3");
    }

    return `https://rasdb.s3.ap-south-1.amazonaws.com/${fileName}`;
  }

  static async createMainsExam(req: any, res: any) {
    try {
      await uploadMiddleware(req, res);

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      // Convert duration and totalMarks to numbers
      const examData = {
        title: req.body.title,
        type: req.body.type,
        duration: Number(req.body.duration), // Convert to number
        totalMarks: Number(req.body.totalMarks), // Convert to number
      };

      // Validate other exam data
      CreateMainsExamSchema.parse(examData);

      // Upload file to S3
      const fileUrl = await MainsExamController.uploadFileToS3(req.file);

      // Create exam in database
      const exam = await prisma.exam.create({
        data: {
          ...examData,
          category: "Mains",
          fileUrl,
          teacherId: req.teacher.id,
        },
      });

      res.status(201).json({
        message: "Mains exam created successfully",
        exam,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          error: "File upload error",
          details: error.message,
        });
      }

      console.error("Error creating mains exam:", error);
      res.status(500).json({
        error: "Failed to create mains exam",
      });
    }
  }

  static async getTeacherMainsExams(req: any, res: any) {
    try {
      const exams = await prisma.exam.findMany({
        where: {
          teacherId: req.teacher.id,
          category: "Mains",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({ exams });
    } catch (error) {
      console.error("Error fetching mains exams:", error);
      res.status(500).json({
        error: "Failed to fetch mains exams",
      });
    }
  }

  static async getMainsExamById(req: any, res: any) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: {
          id,
          category: "Mains",
        },
      });

      if (!exam) {
        return res.status(404).json({
          error: "Mains exam not found",
        });
      }

      // Verify teacher owns this exam
      if (exam.teacherId !== req.teacher.id) {
        return res.status(403).json({
          error: "Not authorized to access this mains exam",
        });
      }

      res.status(200).json({ exam });
    } catch (error) {
      console.error("Error fetching mains exam:", error);
      res.status(500).json({
        error: "Failed to fetch mains exam",
      });
    }
  }

  static async deleteMainsExam(req: any, res: any) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: {
          id,
          category: "Mains",
        },
      });

      if (!exam) {
        return res.status(404).json({
          error: "Mains exam not found",
        });
      }

      // Verify teacher owns this exam
      if (exam.teacherId !== req.teacher.id) {
        return res.status(403).json({
          error: "Not authorized to delete this mains exam",
        });
      }

      // Note: You might want to also delete the file from S3 here
      // That would require additional S3 DeleteObject implementation

      await prisma.exam.delete({
        where: { id },
      });

      res.status(200).json({
        message: "Mains exam deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting mains exam:", error);
      res.status(500).json({
        error: "Failed to delete mains exam",
      });
    }
  }

  static async getFreeMainsExams(req: any, res: any) {
    try {
      const mainsExams = await prisma.exam.findMany({
        where: {
          type: "Free",
          category: "Mains",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(mainsExams);
      res.status(200).json({ mainsExams });
    } catch (error) {
      console.error("Error fetching prelims exams:", error);
      res.status(500).json({
        error: "Failed to fetch prelims exams",
      });
    }
  }
}
