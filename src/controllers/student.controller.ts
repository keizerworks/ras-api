import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { isValidEmail } from '../utils/validation.js';
import { SALT_ROUNDS, TOKEN_EXPIRY } from '../config/constants.js';

const prisma = new PrismaClient();

export const signup = async (req: any, res: any) => {
  try {
    console.log(req.body);
    const { name, email, password, phoneNumber, dateOfBirth } = req.body;

    // Validate input
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create student
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        dateOfBirth
      }
    });

    // Generate token

    if(!process.env.JWT_SECRET){
      throw new Error("JWT secret is not defined in environment variables.");
    }
    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      process.env.JWT_SECRET,
    );

    const { password: _, ...studentWithoutPassword } = student;
    res.status(201).json({
      message: 'Student registered successfully',
      student: studentWithoutPassword,
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

    const student = await prisma.student.findUnique({
      where: { email }
    });

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      process.env.JWT_SECRET || "",
      { expiresIn: TOKEN_EXPIRY }
    );

    const { password: _, ...studentWithoutPassword } = student;
    res.json({
      message: 'Login successful',
      student: studentWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};