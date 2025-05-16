import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import { Status, Priority, Category } from '../types/prisma-enums';

const prisma = new PrismaClient();

export const dashboardController = {
  /**
   * Get high-level dashboard statistics
   */
  getDashboardStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get total counts
      const totalComplaints = await prisma.complaint.count({
        where: filter
      });
      
      const pendingComplaints = await prisma.complaint.count({
        where: {
          ...filter,
          status: Status.PENDING
        }
      });
      
      const inProgressComplaints = await prisma.complaint.count({
        where: {
          ...filter,
          status: Status.IN_PROGRESS
        }
      });
      
      const resolvedComplaints = await prisma.complaint.count({
        where: {
          ...filter,
          status: Status.RESOLVED
        }
      });
      
      const closedComplaints = await prisma.complaint.count({
        where: {
          ...filter,
          status: Status.CLOSED
        }
      });

      const criticalComplaints = await prisma.complaint.count({
        where: {
          ...filter,
          priority: Priority.CRITICAL,
          status: {
            notIn: [Status.RESOLVED, Status.CLOSED]
          }
        }
      });
      
      // Get latest complaints
      const recentComplaints = await prisma.complaint.findMany({
        where: filter,
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          project: {
            select: {
              name: true
            }
          },
          client: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      res.status(200).json({
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        closedComplaints,
        criticalComplaints,
        recentComplaints
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },

  /**
   * Get complaint distribution by category
   */
  getCategoryStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get counts for each category
      const categories = Object.values(Category);
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const count = await prisma.complaint.count({
            where: {
              ...filter,
              category
            }
          });
          return { category, count };
        })
      );
      
      res.status(200).json({ categoryStats });
    } catch (error) {
      console.error('Error fetching category stats:', error);
      res.status(500).json({
        message: 'Failed to fetch category statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  /**
   * Get complaint distribution by status
   */
  getStatusStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get counts for each status
      const statuses = Object.values(Status);
      const statusStats = await Promise.all(
        statuses.map(async (status) => {
          const count = await prisma.complaint.count({
            where: {
              ...filter,
              status
            }
          });
          return { status, count };
        })
      );
      
      res.status(200).json({ statusStats });
    } catch (error) {
      console.error('Error fetching status stats:', error);
      res.status(500).json({
        message: 'Failed to fetch status statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  /**
   * Get complaint distribution by priority
   */
  getPriorityStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get counts for each priority
      const priorities = Object.values(Priority);
      const priorityStats = await Promise.all(
        priorities.map(async (priority) => {
          const count = await prisma.complaint.count({
            where: {
              ...filter,
              priority
            }
          });
          return { priority, count };
        })
      );
      
      res.status(200).json({ priorityStats });
    } catch (error) {
      console.error('Error fetching priority stats:', error);
      res.status(500).json({
        message: 'Failed to fetch priority statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },

  /**
   * Get complaints trend over time (monthly)
   */
  getComplaintsTrend: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get monthly data for the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      
      // Initialize result array with all months
      const monthlyTrend: { month: string; count: number }[] = [];
      
      // Generate last 6 months labels (e.g., "May 2023")
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyTrend.unshift({ month: monthLabel, count: 0 });
      }
      
      // Get complaints grouped by month
      const complaints = await prisma.complaint.findMany({
        where: {
          ...filter,
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true
        }
      });
      
      // Count complaints by month
      complaints.forEach((complaint: { createdAt: string | number | Date; }) => {
        const date = new Date(complaint.createdAt);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const monthData = monthlyTrend.find(m => m.month === monthLabel);
        if (monthData) {
          monthData.count++;
        }
      });
      
      res.status(200).json({ monthlyTrend });
    } catch (error) {
      console.error('Error fetching complaints trend:', error);
      res.status(500).json({
        message: 'Failed to fetch complaints trend',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },

  /**
   * Get project-wise complaint statistics
   */
  getProjectStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get all projects
      const projects = await prisma.project.findMany({
        include: {
          _count: {
            select: { complaints: { where: filter } }
          }
        },
        orderBy: {
          complaints: {
            _count: 'desc'
          }
        },
        take: 5
      });

      // Transform data for better readability
      const projectStats = projects.map((project: { id: any; name: any; _count: { complaints: any; }; }) => ({
        projectId: project.id,
        projectName: project.name,
        complaintCount: project._count.complaints
      }));
      
      res.status(200).json({ projectStats });
    } catch (error) {
      console.error('Error fetching project stats:', error);
      res.status(500).json({
        message: 'Failed to fetch project statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },

  /**
   * Get resolution time analytics
   */
  getResolutionTimeStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get authenticated user
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      // Define filter based on user role
      const filter: any = {};
      if (userRole === 'CLIENT') {
        filter.clientId = userId;
      } else if (userRole === 'SUPPORT') {
        filter.assigneeId = userId;
      }

      // Get resolved complaints with creation and update timestamps
      const resolvedComplaints = await prisma.complaint.findMany({
        where: {
          ...filter,
          status: {
            in: [Status.RESOLVED, Status.CLOSED]
          }
        },
        select: {
          createdAt: true,
          updatedAt: true,
          priority: true
        }
      });
      
      // Calculate average resolution time (in days)
      let totalResolutionTime = 0;
      let criticalResolutionTime = 0;
      let highResolutionTime = 0;
      let mediumResolutionTime = 0;
      let lowResolutionTime = 0;
      
      let criticalCount = 0;
      let highCount = 0;
      let mediumCount = 0;
      let lowCount = 0;
      
      resolvedComplaints.forEach((complaint: { createdAt: Date; updatedAt: Date; priority: import('../../prisma/prisma/generated/client').$Enums.Priority; }) => {
        const creationTime = new Date(complaint.createdAt).getTime();
        const resolutionTime = new Date(complaint.updatedAt).getTime();
        const daysToResolve = (resolutionTime - creationTime) / (1000 * 3600 * 24);
        
        totalResolutionTime += daysToResolve;
        
        // Categorize by priority
        if (complaint.priority === Priority.CRITICAL) {
          criticalResolutionTime += daysToResolve;
          criticalCount++;
        } else if (complaint.priority === Priority.HIGH) {
          highResolutionTime += daysToResolve;
          highCount++;
        } else if (complaint.priority === Priority.MEDIUM) {
          mediumResolutionTime += daysToResolve;
          mediumCount++;
        } else if (complaint.priority === Priority.LOW) {
          lowResolutionTime += daysToResolve;
          lowCount++;
        }
      });
      
      const averageResolutionTime = resolvedComplaints.length > 0 
        ? +(totalResolutionTime / resolvedComplaints.length).toFixed(1) 
        : 0;
      
      const averageResolutionTimeByPriority = {
        CRITICAL: criticalCount > 0 ? +(criticalResolutionTime / criticalCount).toFixed(1) : 0,
        HIGH: highCount > 0 ? +(highResolutionTime / highCount).toFixed(1) : 0,
        MEDIUM: mediumCount > 0 ? +(mediumResolutionTime / mediumCount).toFixed(1) : 0,
        LOW: lowCount > 0 ? +(lowResolutionTime / lowCount).toFixed(1) : 0
      };
      
      res.status(200).json({
        averageResolutionTime,
        averageResolutionTimeByPriority,
        totalResolved: resolvedComplaints.length
      });
    } catch (error) {
      console.error('Error fetching resolution time stats:', error);
      res.status(500).json({
        message: 'Failed to fetch resolution time statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },

  /**
   * Get workload distribution among support staff
   * Admin-only endpoint
   */
  getWorkloadDistribution: async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      const userRole = (req as any).user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Unauthorized: Admin access required' });
        return;
      }

      // Get all support users
      const supportUsers = await prisma.user.findMany({
        where: {
          role: 'SUPPORT'
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              assignedComplaints: {
                where: {
                  status: {
                    in: [Status.PENDING, Status.IN_PROGRESS]
                  }
                }
              }
            }
          }
        },
        orderBy: {
          assignedComplaints: {
            _count: 'desc'
          }
        }
      });

      // Transform data
      const workloadDistribution = supportUsers.map((user: { id: any; name: any; email: any; _count: { assignedComplaints: any; }; }) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        activeComplaints: user._count.assignedComplaints
      }));
      
      res.status(200).json({ workloadDistribution });
    } catch (error) {
      console.error('Error fetching workload distribution:', error);
      res.status(500).json({
        message: 'Failed to fetch workload distribution',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
};

export default dashboardController;