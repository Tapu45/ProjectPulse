import nodemailer from 'nodemailer';
// import { UserRole } from '@prisma/client';
import { UserRole } from '../types/prisma-enums';

/**
 * Email service for sending various types of emails using Gmail
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    // Configure Gmail transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your_email@gmail.com',
        // You can use an app password for better security
        // https://support.google.com/accounts/answer/185833
        pass: process.env.GMAIL_APP_PASSWORD || 'your_app_password',
      },
    });
  }
  
  /**
   * Send welcome email to a newly created user with role-specific content
   * @param name User's name
   * @param email User's email address
   * @param role User's role in the system
   */
  async sendWelcomeEmail(name: string, email: string, role: UserRole): Promise<void> {
    try {
      const { subject, html } = this.getWelcomeEmailContent(name, role);
      
      const mailOptions = {
        from: `"ProjectPulse Team" <${process.env.GMAIL_USER || 'projectpulse@gmail.com'}>`,
        to: email,
        subject,
        html,
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email} (${role})`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw the error to prevent API failures due to email issues
    }
  }
  
  /**
   * Generate welcome email content based on user role
   */
  private getWelcomeEmailContent(name: string, role: UserRole): { subject: string; html: string } {
    let subject: string;
    let content: string;
    
    switch (role) {
      case 'ADMIN':
        subject = 'Welcome to ProjectPulse - Administrator Account Created';
        content = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #3f51b5;">Welcome to ProjectPulse</h1>
              <p style="font-size: 18px; color: #555;">Administrator Account</p>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>Your administrator account has been successfully created in the ProjectPulse system.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #3f51b5;">As an administrator, you have access to:</h3>
              <ul style="padding-left: 20px;">
                <li>Complete user management capabilities</li>
                <li>System configuration and settings</li>
                <li>Analytics and reporting dashboards</li>
                <li>Project oversight across the entire platform</li>
                <li>Security and permission controls</li>
              </ul>
            </div>
            
            <p>Please log in to explore your administrative dashboard and complete your profile setup.</p>
            <p>password: <Your_First_Name@321></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://projectpulse.example.com'}/login" 
                 style="background-color: #3f51b5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Login to Dashboard
              </a>
            </div>
            
            <p>If you need any assistance getting started, please consult the administrator documentation or contact our technical support team.</p>
            
            <p>Best regards,<br>The ProjectPulse Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;
        
      case 'SUPPORT':
        subject = 'Welcome to ProjectPulse Support Team';
        content = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #00897b;">Welcome to ProjectPulse</h1>
              <p style="font-size: 18px; color: #555;">Support Team Member</p>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>Your support team account has been created in ProjectPulse. We're excited to have you on our support team!</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #00897b;">Your support role includes:</h3>
              <ul style="padding-left: 20px;">
                <li>Handling client support tickets and inquiries</li>
                <li>Monitoring system health and performance</li>
                <li>Providing technical assistance to users</li>
                <li>Documenting common issues and solutions</li>
                <li>Collaborating with development teams on bug fixes</li>
              </ul>
            </div>
            
            <p>Your support dashboard is ready to go. You'll start receiving notifications for support requests after logging in.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://projectpulse.example.com'}/login" 
                 style="background-color: #00897b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Access Support Dashboard
              </a>
            </div>
            
            <p>Please review the support protocols and knowledge base to familiarize yourself with our processes.</p>
            
            <p>Welcome aboard!<br>The ProjectPulse Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;
        
      case 'CLIENT':
      default:
        subject = 'Welcome to ProjectPulse - Your Account is Ready';
        content = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2196f3;">Welcome to ProjectPulse</h1>
              <p style="font-size: 18px; color: #555;">Your Project Management Portal</p>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>Welcome to ProjectPulse! Your client account has been successfully created, and we're excited to have you on board.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2196f3;">With your client account, you can:</h3>
              <ul style="padding-left: 20px;">
                <li>View real-time progress on your projects</li>
                <li>Access important documents and deliverables</li>
                <li>Communicate with project teams</li>
                <li>Submit feature requests and feedback</li>
                <li>Track milestone completions and project timelines</li>
              </ul>
            </div>
            
            <p>Your personalized dashboard is ready for you to explore. We recommend completing your profile and setting your notification preferences.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://projectpulse.example.com'}/login" 
                 style="background-color: #2196f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>
            
            <p>If you have any questions or need assistance, our support team is ready to help you.</p>
            
            <p>Thank you for choosing ProjectPulse!<br>The ProjectPulse Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;
    }
    
    return { subject, html: content };
  }

  // Add this method to your EmailService class
async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
  try {
    const resetUrl = `${process.env.PASSWORD_RESET_URL }?token=${resetToken}`;
    
    const mailOptions = {
      from: `"ProjectPulse Team" <${process.env.GMAIL_USER || 'projectpulse@gmail.com'}>`,
      to: email,
      subject: 'Password Reset Instructions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2196f3;">Password Reset Request</h1>
            <p style="font-size: 18px; color: #555;">ProjectPulse Account Recovery</p>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>We received a request to reset your password for your ProjectPulse account. To proceed with resetting your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p>This password reset link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
          
          <p>Best regards,<br>The ProjectPulse Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}
}

// Export a singleton instance
export const emailService = new EmailService();