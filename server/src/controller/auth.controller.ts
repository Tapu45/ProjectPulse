import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
 import { emailService } from '../utils/emailService';
import crypto from 'crypto';


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
       res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // If user doesn't exist or password doesn't match
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
       res.status(401).json({ message: 'Invalid credentials' });
        return;
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

  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, organization } = req.body;
      
      // Validate request
      if (!name || !email || !password) {
       res.status(400).json({ message: 'Name, email, and password are required' });
        return;
      }
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
         res.status(409).json({ message: 'User with this email already exists' });
        return;
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
  },

  getCurrentUser: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the user ID from the request object (set by authenticate middleware)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized access' });
        return;
      }
      
      // Find the user by ID
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Return the user data without the password
      const { password: _, ...userData } = user;
      
      res.status(200).json(userData);
      
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

// Update the forgotPassword method:
forgotPassword: async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Don't reveal if the user exists or not for security reasons
    if (!user) {
      res.status(200).json({ message: 'If this email exists in our system, you will receive password reset instructions' });
      return;
    }
    
    // Generate a reset token as a JWT with user ID and a unique value
    const resetToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        purpose: 'password-reset',
        // Add a random string to make the token unique and single-use
        nonce: crypto.randomBytes(16).toString('hex') 
      },
      JWT_SECRET + user.password.slice(-10), // Add part of the hashed password as salt
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    // Send password reset email with the token
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    
    res.status(200).json({ message: 'If this email exists in our system, you will receive password reset instructions' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},


resetPassword: async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }
    
    try {
      // First find the user without verifying the token
      // We need to extract the email from the token to find the user
      const decoded = jwt.decode(token) as { id: string; email: string; purpose: string } | null;
      
      if (!decoded || !decoded.id || decoded.purpose !== 'password-reset') {
        res.status(400).json({ message: 'Invalid reset token' });
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        res.status(400).json({ message: 'Invalid reset token' });
        return;
      }
      
      // Now verify the token with the user's password fragment as additional secret
      try {
        jwt.verify(token, JWT_SECRET + user.password.slice(-10));
      } catch (err) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user's password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword
        }
      });
      
      res.status(200).json({ message: 'Password updated successfully' });
      
    } catch (jwtError) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

};

export default authController;