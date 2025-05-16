import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import { Status, Priority, Category, NotificationType } from '../types/prisma-enums';
import { upload, uploadToCloudinary } from '../utils/cloudinary';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const issueController = {

  createComplaint: [
    upload.array('attachments', 5), // Allow up to 5 file uploads
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }

        const {
          projectId,
          title,
          description,
          category,
          priority = 'MEDIUM'
        } = req.body;

        // Validate required fields
        if (!projectId || !title || !description || !category) {
          res.status(400).json({
            message: 'Missing required fields: projectId, title, description, and category are required'
          });
          return;
        }

        // Validate category
        if (!Object.values(Category).includes(category)) {
          res.status(400).json({ message: 'Invalid category' });
          return;
        }

        // Get user ID from authenticated session
        // Assuming authentication middleware sets user in req object
        const clientId = (req as any).user?.id;
        
        
        if (!clientId) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }

        // Process attachments if present
        interface Attachment {
          fileName: string;
          fileType: string;
          filePath: string;
          fileSize: number;
        }

        const attachments: Attachment[] = [];
        if (req.files && Array.isArray(req.files)) {
          const files = req.files as Express.Multer.File[];

          // Upload each file to Cloudinary
          for (const file of files) {
            try {
              const result = await uploadToCloudinary(file.buffer, {
                folder: 'complaint_attachments',
                resource_type: 'auto'
              });

              attachments.push({
                fileName: file.originalname,
                fileType: file.mimetype,
                filePath: result.secure_url,
                fileSize: file.size
              });
            } catch (error) {
              console.error('Error uploading file to Cloudinary:', error);
            }
          }
        }

        // Create complaint with transaction to ensure all operations complete
        const complaint = await prisma.$transaction(async (tx) => {
          // Create the complaint
          const newComplaint = await tx.complaint.create({
            data: {
              projectId,
              clientId,
              title,
              description,
              category: category as Category,
              priority: priority as Priority,
              status: Status.PENDING
            }
          });

          // Create attachments if any
          if (attachments.length > 0) {
            await tx.attachment.createMany({
              data: attachments.map(attachment => ({
                ...attachment,
                complaintId: newComplaint.id
              }))
            });
          }

          // Import NotificationType at the top of your file:
          // import { NotificationType } from '../types/prisma-enums';
          await tx.notification.create({
            data: {
              userId: clientId, // Can be modified to target specific admin users
              message: `New complaint submitted: ${title}`,
              type: NotificationType.COMPLAINT_SUBMITTED,
              isRead: false
            }
          });

          return tx.complaint.findUnique({
            where: { id: newComplaint.id },
            include: {
              attachments: true,
              project: true
            }
          });
        });

        res.status(201).json({
          message: 'Complaint created successfully',
          complaint
        });
        return;
      } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({
          message: 'Failed to create complaint',
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
        return;
      }
    }
  ],

  getComplaintById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: {
          project: true,
          client: {
            select: { id: true, name: true, email: true, organization: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          attachments: true,
          responses: {
            include: {
              user: {
                select: { id: true, name: true, role: true }
              },
              attachments: true
            },
            orderBy: { createdAt: 'asc' }
          },
          history: {
          include: {
            createdBy: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
        }
      });

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found' });
        return;
      }

      res.status(200).json(complaint);
      return;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      res.status(500).json({
        message: 'Failed to fetch complaint',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

  updateComplaint: [
    upload.array('attachments', 5),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const {
          title,
          description,
          category,
          status,
          priority,
          assigneeId
        } = req.body;

        // Check if complaint exists
        const existingComplaint = await prisma.complaint.findUnique({
          where: { id },
          include: {
            client: true
          }
        });

        if (!existingComplaint) {
          res.status(404).json({ message: 'Complaint not found' });
          return;
        }

        // User authentication check
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        // Clients can only update their own complaints and only if status is PENDING
        if (userRole === 'CLIENT' &&
          (existingComplaint.clientId !== userId ||
            existingComplaint.status !== 'PENDING')) {
          res.status(403).json({
            message: 'You can only update your own pending complaints'
          });
          return;
        }

        // Process new attachments if present
        const newAttachments: {
          fileName: string;
          fileType: string;
          filePath: string;
          fileSize: number;
          complaintId: string;
        }[] = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          const files = req.files as Express.Multer.File[];

          for (const file of files) {
            try {
              const result = await uploadToCloudinary(file.buffer, {
                folder: 'complaint_attachments',
                resource_type: 'auto'
              });

              newAttachments.push({
                fileName: file.originalname,
                fileType: file.mimetype,
                filePath: result.secure_url,
                fileSize: file.size,
                complaintId: id
              });
            } catch (error) {
              console.error('Error uploading file to Cloudinary:', error);
            }
          }
        }

        // Build update data object
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (priority) updateData.priority = priority;

        // Status and assignee management (only for admin/support)
        if (['ADMIN', 'SUPPORT'].includes(userRole)) {
          if (status) updateData.status = status;
          if (assigneeId) updateData.assigneeId = assigneeId;
        }

        // Update complaint with transaction
        const updatedComplaint = await prisma.$transaction(async (tx) => {
          
        
          // Update the complaint
          const updated = await tx.complaint.update({
            where: { id },
            data: updateData,
            include: {
              project: true,
              client: {
                select: { id: true, name: true, email: true }
              },
              assignee: {
                select: { id: true, name: true, email: true }
              },
              attachments: true
            }
          });

          // Add new attachments if any
          if (newAttachments.length > 0) {
            await tx.attachment.createMany({
              data: newAttachments
            });
          }

          // Create notification if status changed
          if (status && status !== existingComplaint.status) {
             await tx.complaintHistory.create({
    data: {
      complaintId: id,
      status: status as Status,
      message: `Status updated from ${existingComplaint.status} to ${status}`,
      userId
    }
  });
            await tx.notification.create({
              data: {
                userId: existingComplaint.clientId,
                message: `Complaint status updated to ${status}`,
                type: 'STATUS_UPDATED',
                isRead: false
              }
            });
          }

          // Create notification if assignee changed
          if (assigneeId && assigneeId !== existingComplaint.assigneeId) {
            await tx.notification.create({
              data: {
                userId: assigneeId,
                message: `You've been assigned to complaint: ${existingComplaint.title}`,
                type: 'ASSIGNED',
                isRead: false
              }
            });
          }

          return updated;
        });

        res.status(200).json({
          message: 'Complaint updated successfully',
          complaint: updatedComplaint
        });
        return;
      } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({
          message: 'Failed to update complaint',
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
        return;
      }
    }
  ],

  deleteComplaint: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if complaint exists
      const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: { attachments: true }
      });

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found' });
        return;
      }

      // User authentication check
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Only admin or the client who created the complaint can delete (if pending)
      if (userRole !== 'ADMIN' &&
        (complaint.clientId !== userId ||
          complaint.status !== 'PENDING')) {
        res.status(403).json({
          message: 'Unauthorized to delete this complaint'
        });
        return
      }

      // Delete with transaction to ensure all related data is removed
      await prisma.$transaction(async (tx: { attachment: { deleteMany: (arg0: { where: { complaintId: string; } | { responseId: any; }; }) => any; }; response: { findMany: (arg0: { where: { complaintId: string; }; }) => any; deleteMany: (arg0: { where: { complaintId: string; }; }) => any; }; notification: { deleteMany: (arg0: { where: { message: { contains: any; }; }; }) => any; }; complaint: { delete: (arg0: { where: { id: string; }; }) => any; }; }) => {
        // Delete attachments
        await tx.attachment.deleteMany({
          where: { complaintId: id }
        });

        // Delete responses and their attachments
        const responses = await tx.response.findMany({
          where: { complaintId: id }
        });

        for (const response of responses) {
          await tx.attachment.deleteMany({
            where: { responseId: response.id }
          });
        }

        await tx.response.deleteMany({
          where: { complaintId: id }
        });

        // Delete notifications related to this complaint
        // Note: This is a simple approach; in practice, you might need to filter more specifically
        await tx.notification.deleteMany({
          where: {
            message: { contains: complaint.title }
          }
        });

        // Finally delete the complaint
        await tx.complaint.delete({
          where: { id }
        });
      });

      res.status(200).json({
        message: 'Complaint deleted successfully'
      });
      return
    } catch (error) {
      console.error('Error deleting complaint:', error);
      res.status(500).json({
        message: 'Failed to delete complaint',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return
    }
  },

  getUserComplaints: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from authenticated session
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get query parameters
      const {
        status,
        category,
        priority,
        projectId,
        page = 1,
        limit = 10
      } = req.query;

      // Build filter object with clientId as the logged-in user
      const filter: any = { clientId: userId };

      // Add optional filters
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (projectId) filter.projectId = projectId as string;

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get total count for pagination
      const totalCount = await prisma.complaint.count({
        where: filter
      });

      // Get complaints with relations
      const complaints = await prisma.complaint.findMany({
        where: filter,
        include: {
          project: true,
          client: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          attachments: true,
          _count: {
            select: { responses: true }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        complaints,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / Number(limit)),
          limit: Number(limit)
        }
      });
      return;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      res.status(500).json({
        message: 'Failed to fetch your complaints',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

  getAllComplaints: async (req: Request, res: Response): Promise<void> => {
    try {
      // Check user authorization - only ADMIN and SUPPORT should access all complaints
      const userRole = (req as any).user?.role;
      if (!['ADMIN', 'SUPPORT'].includes(userRole)) {
        res.status(403).json({ message: 'Unauthorized. Only admin and support can access all complaints' });
        return;
      }

      // Extract query parameters with defaults
      const {
        status,
        category,
        priority,
        projectId,
        clientId,
        assigneeId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = req.query;

      // Build filter object
      const filter: any = {};

      // Add optional filters
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (projectId) filter.projectId = projectId as string;
      if (clientId) filter.clientId = clientId as string;
      if (assigneeId) {
        filter.assigneeId = assigneeId === 'unassigned'
          ? null
          : assigneeId as string;
      }

      // Add search capability
      if (search) {
        filter.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Determine sort order and field
      const orderBy: any = {};
      const validSortFields = [
        'createdAt', 'updatedAt', 'priority', 'status', 'title'
      ];

      const sortField = validSortFields.includes(sortBy as string)
        ? sortBy as string
        : 'createdAt';

      orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

      // Get total count for pagination
      const totalCount = await prisma.complaint.count({
        where: filter
      });

      // Get complaints with relations
      const complaints = await prisma.complaint.findMany({
        where: filter,
        include: {
          project: {
            select: { id: true, name: true }
          },
          client: {
            select: { id: true, name: true, email: true, organization: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          attachments: {
            select: { id: true, fileName: true, filePath: true }
          },
          _count: {
            select: { responses: true }
          }
        },
        skip,
        take,
        orderBy
      });

      // Group complaints by status for dashboard overview
      const statusCounts = await prisma.$queryRaw`
  SELECT status, COUNT(*)::integer as count
  FROM "Complaint"
  GROUP BY status
`;

      res.status(200).json({
        complaints,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / Number(limit)),
          limit: Number(limit)
        },
        metrics: {
          statusCounts
        }
      });
      return;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({
        message: 'Failed to fetch complaints',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

  getAssignedComplaints: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from authenticated session
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Only support and admin roles can have assigned complaints
      if (!['ADMIN', 'SUPPORT'].includes(userRole)) {
        res.status(403).json({ message: 'Forbidden. Only support and admin users can access assigned complaints' });
        return;
      }

      // Extract query parameters with defaults
      const {
        status,
        category,
        priority,
        projectId,
        clientId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = req.query;

      // Build filter object with assigneeId as the logged-in user
      const filter: any = { assigneeId: userId };

      // Add optional filters
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (projectId) filter.projectId = projectId as string;
      if (clientId) filter.clientId = clientId as string;

      // Add search capability
      if (search) {
        filter.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Determine sort order and field
      const orderBy: any = {};
      const validSortFields = [
        'createdAt', 'updatedAt', 'priority', 'status', 'title'
      ];

      const sortField = validSortFields.includes(sortBy as string)
        ? sortBy as string
        : 'createdAt';

      orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

      // Get total count for pagination
      const totalCount = await prisma.complaint.count({
        where: filter
      });

      // Get complaints with relations
      const complaints = await prisma.complaint.findMany({
        where: filter,
        include: {
          project: {
            select: { id: true, name: true }
          },
          client: {
            select: { id: true, name: true, email: true, organization: true }
          },
          attachments: {
            select: { id: true, fileName: true, filePath: true }
          },
          _count: {
            select: { responses: true }
          }
        },
        skip,
        take,
        orderBy
      });

      // Group assigned complaints by status for overview
      const statusCounts = await prisma.$queryRaw`
        SELECT status, COUNT(*)::integer as count
        FROM "Complaint"
        WHERE "assigneeId" = ${userId}
        GROUP BY status
      `;

      res.status(200).json({
        complaints,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / Number(limit)),
          limit: Number(limit)
        },
        metrics: {
          statusCounts
        }
      });
      return;
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      res.status(500).json({
        message: 'Failed to fetch assigned complaints',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },
 
  resolveComplaint: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { resolutionComment } = req.body;

      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!resolutionComment) {
        res.status(400).json({ message: 'Resolution comment is required' });
        return;
      }

      // Get user from authenticated session
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Only support and admin roles can resolve complaints
      if (!['ADMIN', 'SUPPORT'].includes(userRole)) {
        res.status(403).json({ message: 'Forbidden. Only support and admin users can resolve complaints' });
        return;
      }

      // Check if complaint exists and user is the assignee
      const complaint = await prisma.complaint.findFirst({
        where: {
          id,
          OR: [
            { assigneeId: userId },
            {
              AND: [
                { assigneeId: null },
                { assigneeId: null } // Unassigned complaints can be resolved by admins
              ]
            }
          ]
        },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      });

      if (!complaint) {
        res.status(404).json({
          message: 'Complaint not found or you are not authorized to resolve it'
        });
        return;
      }

      // Check if complaint is already resolved or closed
      if (['RESOLVED', 'CLOSED'].includes(complaint.status)) {
        res.status(400).json({
          message: `Complaint is already ${complaint.status.toLowerCase()}`
        });
        return;
      }

      // Update complaint status and add resolution response in a transaction
     const result = await prisma.$transaction(async (tx) => {
  // Update complaint status to RESOLVED
  const updatedComplaint = await tx.complaint.update({
    where: { id },
    data: {
      status: Status.RESOLVED,
      assigneeId: userId, // Ensure the current user is assigned if not already
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
      client: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Create a resolution response
  const response = await tx.response.create({
    data: {
      complaintId: id,
      userId: userId,
      message: resolutionComment,
    },
  });

   await tx.complaintHistory.create({
        data: {
          complaintId: id,
          status: Status.RESOLVED,
          message: `Complaint resolved: ${resolutionComment}`,
          userId
        }
      });

  // Create notification for the client
  await tx.notification.create({
    data: {
      userId: complaint.clientId,
      message: `Your complaint "${complaint.title}" has been resolved.`,
      type: 'RESOLVED',
      isRead: false,
    },
  });

  return { updatedComplaint, response };
});

      res.status(200).json({
        message: 'Complaint resolved successfully',
        complaint: result.updatedComplaint,
        resolution: result.response
      });
      return;
    } catch (error) {
      console.error('Error resolving complaint:', error);
      res.status(500).json({
        message: 'Failed to resolve complaint',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },
  // In your complaint controller
  updateComplaintStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, message } = req.body;
      const userId = (req as any).user.id;

      // First, check if the complaint exists
      const complaint = await prisma.complaint.findUnique({
        where: { id },
      });

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found' });
        return;
      }

      // Create a transaction to update status and add history entry
      const result = await prisma.$transaction([
        // Update the complaint status
        prisma.complaint.update({
          where: { id },
          data: { status }
        }),

        // Create history record for this status change
        // Create history record for this status change
        prisma.complaintHistory.create({
          data: {
            complaintId: id,
            status,
            message: message || `Status changed to ${status}`,
            userId
          }
        }),

        // Also create a response for the status change
      //   prisma.complaintResponse.create({
      //     data: {
      //       complaintId: id,
      //       userId,
      //       message: message || `Status changed to ${status}`,
      //     }
      //   })
      ]);

      res.status(200).json({
        message: 'Complaint status updated successfully',
        complaint: result[0]
      });
    } catch (error) {
      console.error('Error updating complaint status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  respondToResolution: async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body;
    
    // Validate request
    if (!['APPROVE', 'REJECT'].includes(action)) {
      res.status(400).json({ message: 'Invalid action. Must be APPROVE or REJECT' });
      return;
    }
    
    // Get user from authenticated session
    const userId = (req as any).user?.id;
    
    
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    // Check if complaint exists and user is the original submitter
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        clientId: userId,
        status: 'RESOLVED' // Only resolved complaints can be approved/rejected
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!complaint) {
      res.status(404).json({
        message: 'Resolved complaint not found or you are not authorized to respond'
      });
      return;
    }
    
    // Handle the client's response in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update complaint status based on client action
      const newStatus = action === 'APPROVE' ? Status.CLOSED : Status.IN_PROGRESS;
      
      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: {
          status: newStatus
        }
      });
      
      // Create history entry
      await tx.complaintHistory.create({
        data: {
          complaintId: id,
          status: newStatus,
          message: action === 'APPROVE' 
            ? `Client approved resolution: ${feedback || 'No additional feedback'}`
            : `Client rejected resolution: ${feedback || 'No additional feedback'}`,
          userId
        }
      });
      
      // Create response entry to show in the timeline
      await tx.response.create({
        data: {
          complaintId: id,
          userId,
          message: action === 'APPROVE'
            ? `✅ I approve this resolution. ${feedback ? `Comments: ${feedback}` : ''}`
            : `❌ I reject this resolution. ${feedback ? `Reason: ${feedback}` : 'Please revisit this issue.'}`
        }
      });
      
      // Create notification for the assignee
      if (complaint.assigneeId) {
        await tx.notification.create({
          data: {
            userId: complaint.assigneeId,
            message: action === 'APPROVE'
              ? `Client approved resolution for complaint "${complaint.title}"`
              : `Client rejected resolution for complaint "${complaint.title}". Please revisit.`,
            type: action === 'APPROVE' ? 'STATUS_UPDATED' : 'STATUS_UPDATED',
            isRead: false,
            metadata: JSON.stringify({
              complaintId: id,
              complaintTitle: complaint.title,
              previousStatus: 'RESOLVED',
              newStatus: newStatus,
              feedback: feedback || null
            })
          }
        });
      }
      
      return updatedComplaint;
    });
    
    res.status(200).json({
      message: action === 'APPROVE' 
        ? 'Resolution approved. Complaint closed successfully.' 
        : 'Resolution rejected. Complaint reopened for further review.',
      complaint: result
    });
    return;
  } catch (error) {
    console.error('Error processing resolution response:', error);
    res.status(500).json({
      message: 'Failed to process your response',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
    return;
  }
  },

  getComplaintStats: async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from authenticated session
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get counts for each status
    const stats = await prisma.$transaction([
      prisma.complaint.count({
        where: { clientId: userId }
      }),
      prisma.complaint.count({
        where: {
          clientId: userId,
          status: 'RESOLVED'
        }
      }),
      prisma.complaint.count({
        where: {
          clientId: userId,
          status: 'CLOSED'
        }
      }),
      prisma.complaint.count({
        where: {
          clientId: userId,
          status: 'IN_PROGRESS'
        }
      }),
      prisma.complaint.count({
        where: {
          clientId: userId,
          status: 'PENDING'
        }
      }),
      prisma.complaint.count({
        where: {
          clientId: userId,
          status: 'WITHDRAWN'
        }
      })
    ]);

    // Format the response
    res.status(200).json({
      total: stats[0],
      resolved: stats[1],
      closed: stats[2],
      inProgress: stats[3],
      pending: stats[4],
      withdrawn: stats[5]
    });
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({
      message: 'Failed to fetch complaint statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
};

export default issueController;