import { Request, Response } from 'express';
import { PrismaClient , NotificationType} from '../../prisma/prisma/generated/client';
const prisma = new PrismaClient();

const notificationController = {
 
  createNotification: async (
    userId: string,
    message: string,
    type: NotificationType
  ) => {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type,
          isRead: false
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  getUserNotifications: async (req: Request, res: Response): Promise<void> => {
    try {
       const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      
      // Optional query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Optional filter for read/unread
      const isReadFilter = req.query.isRead === 'true' 
        ? true 
        : req.query.isRead === 'false' 
          ? false 
          : undefined;
      
      // Get total count for pagination
      const totalCount = await prisma.notification.count({
        where: {
          userId,
          ...(isReadFilter !== undefined && { isRead: isReadFilter }),
        },
      });
      
      // Get notifications with pagination
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(isReadFilter !== undefined && { isRead: isReadFilter }),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      
      res.status(200).json({
        data: notifications,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  },
  
  getUnreadCount: async (req: Request, res: Response): Promise<void> => {
    try {
     const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
      
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      res.status(500).json({ message: 'Error counting unread notifications' });
    }
  },
  
  markAsRead: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      const { id } = req.params;
      
      // Verify the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });
      
      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      
      // Update the notification
      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  },
  
  markAllAsRead: async (req: Request, res: Response): Promise<void> => {
    try {
       const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });
      
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Error marking all notifications as read' });
    }
  },
  
  deleteNotification: async (req: Request, res: Response): Promise<void> => {
    try {
     const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      const { id } = req.params;
      
      // Verify the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });
      
      if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      
      // Delete the notification
      await prisma.notification.delete({
        where: { id },
      });
      
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Error deleting notification' });
    }
  },
  
  deleteAllRead: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return;
        }
      
      const result = await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
        },
      });
      
      res.status(200).json({ 
        message: 'Read notifications deleted successfully',
        count: result.count
      });
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      res.status(500).json({ message: 'Error deleting read notifications' });
    }
  }
};

export default notificationController;