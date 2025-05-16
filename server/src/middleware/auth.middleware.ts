import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // If user doesn't exist or password doesn't match
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user data and token (excluding password)
      const { password: _, ...userData } = user;
      
      res.status(200).json({
        message: 'Login successful',
        user: userData,
        token
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, organization } = req.body;
      
      // Validate request
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user with CLIENT role by default
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          organization,
          role: 'CLIENT' // Default role
        }
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Return user data and token (excluding password)
      const { password: _, ...userData } = newUser;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userData,
        token
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return; // Ensure the function returns void
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    (req as any).user = decoded; // Attach the decoded user to the request object
    next(); // Call next() to proceed to the next middleware or route handler
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return; // Ensure the function returns void
  }
};

export default authController;