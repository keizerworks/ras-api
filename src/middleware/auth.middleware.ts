import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authenticateTeacher = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    if(!process.env.JWT_SECRET){
     //throw new Error("JWT secret is not defined in environment variables.");
    }
    //@ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if(!decoded.role){
     //throw new Error("JWT role not found")
    }

    if(decoded.role !== "teacher"){
      return res.status(401).json({ error: 'Not authorized 1' });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: decoded.id }
    });

    if (!teacher) {
      return res.status(401).json({ error: 'Not authorized 2' });
    }

    req.teacher = {
      id: teacher.id,
      email: teacher.email,
      name: teacher.name
    };

    next();
  } catch (error) {
    res.status(401).json({'Not authorized 3' : error});
  }
};


const authenticateStudent = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    if(!process.env.JWT_SECRET){
     //throw new Error("JWT secret is not defined in environment variables.");
    }
    //@ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if(!decoded.role){
     //throw new Error("JWT role not found")
    }

    if(decoded.role !== "student"){
      return res.status(401).json({ error: 'Not authorized' });
    }

    const student = await prisma.student.findUnique({
      where: { id: decoded.id }
    });

    if (!student) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    req.student = {
      id: student.id,
      email: student.email,
      name: student.name
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
};



export {authenticateTeacher, authenticateStudent}