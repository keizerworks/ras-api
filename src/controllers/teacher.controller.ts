import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { isValidEmail } from '../utils/validation.js';
import { SALT_ROUNDS, TOKEN_EXPIRY } from '../config/constants.js';

const prisma = new PrismaClient();

export const signup = async (req: any, res: any) => {
  try {
    console.log(req.body);
    const { name, email, password, phoneNumber } = req.body;

    // Validate input
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create teacher
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber
      }
    });

    // Generate token

    if(!process.env.JWT_SECRET){
      //throw new Error("JWT secret is not defined in environment variables.");
    }
    const token = jwt.sign(
      { id: teacher.id, email: teacher.email, role: 'teacher' },
      //@ts-ignore
      process.env.JWT_SECRET,
      // { expiresIn: TOKEN_EXPIRY }
    );

    const { password: _, ...teacherWithoutPassword } = teacher;
    res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: teacherWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signin = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (!teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, teacher.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: teacher.id, email: teacher.email, role:'teacher' },
      process.env.JWT_SECRET || "",
      { expiresIn: TOKEN_EXPIRY }
    );

    const { password: _, ...teacherWithoutPassword } = teacher;
    res.json({
      message: 'Login successful',
      teacher: teacherWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};