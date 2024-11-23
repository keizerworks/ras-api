import jwt, { JwtPayload } from 'jsonwebtoken';

type Role = 'student' | 'teacher';

export const generateToken = (id: string, role: Role): string => {
    if (!process.env.JWT_SECRET) {
     //throw new Error('JWT secret is not defined in environment variables');
    }
  
    return jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  };