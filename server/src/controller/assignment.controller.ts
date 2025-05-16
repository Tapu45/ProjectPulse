import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import { UserRole } from '../types/prisma-enums';

const prisma = new PrismaClient();

export const adminController = {
  /**
   * Assign a complaint to a staff member
   */
  assignComplaint: async (req: Request, res: Response): Promise<void> => {
    try {
      const { complaintId, assigneeId } = req.body;

      // Validate required fields
      if (!complaintId || !assigneeId) {
        res.status(400).json({
          message: 'Both complaintId and assigneeId are required'
        });
        return;
      }

      // Check if user is authorized (admin or support manager)
      const userRole = (req as any).user?.role;
      if (!['ADMIN', 'SUPPORT_MANAGER'].includes(userRole)) {
        res.status(403).json({
          message: 'Unauthorized. Only admins and support managers can assign complaints.'
        });
        return;
      }

      // Check if complaint exists
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: { assignee: true }
      });

      if (!complaint) {
        res.status(404).json({ message: 'Complaint not found' });
        return;
      }

      // Check if assignee exists and is support staff
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        res.status(404).json({ message: 'Assignee not found' });
        return;
      }

      if (!['ADMIN', 'SUPPORT', 'SUPPORT_MANAGER'].includes(assignee.role)) {
        res.status(400).json({
          message: 'Complaints can only be assigned to support staff or admins'
        });
        return;
      }

      // Update complaint with new assignee
      const updatedComplaint = await prisma.$transaction(async (tx) => {
        // Update the complaint
        const updated = await tx.complaint.update({
          where: { id: complaintId },
          data: {
            assigneeId,
            // If complaint is pending, automatically move to in_progress when assigned
            status: complaint.status === 'PENDING' ? 'IN_PROGRESS' : complaint.status
          },
          include: {
            project: true,
            client: {
              select: { id: true, name: true, email: true }
            },
            assignee: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        });

        // Create notification for new assignee
        await tx.notification.create({
          data: {
            userId: assigneeId,
            message: `You've been assigned to complaint: ${complaint.title}`,
            type: 'ASSIGNED' as any,
            isRead: false,
          }
        });

        // Create notification for client
        await tx.notification.create({
          data: {
            userId: complaint.clientId,
            message: `Your complaint "${complaint.title}" has been assigned to ${assignee.name}`,
            type: 'STATUS_UPDATED' as any,
            isRead: false,
          }
        });

        // If there was a previous assignee that is different from the new one, notify them
        if (complaint.assigneeId && complaint.assigneeId !== assigneeId) {
          await tx.notification.create({
            data: {
              userId: complaint.assigneeId,
              message: `Complaint "${complaint.title}" has been reassigned from you to ${assignee.name}`,
              type: 'ASSIGNED' as any,
              isRead: false,
            }
          });
        }

        // Log the assignment action

        return updated;
      });

      res.status(200).json({
        message: 'Complaint assigned successfully',
        complaint: updatedComplaint
      });
      return;
    } catch (error) {
      console.error('Error assigning complaint:', error);
      res.status(500).json({
        message: 'Failed to assign complaint',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

 /**
 * Get list of available staff members who can be assigned to complaints
 */
getAssignableStaff: async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authorized
    const userRole = (req as any).user?.role;
    if (!['ADMIN', 'SUPPORT_MANAGER'].includes(userRole)) {
      res.status(403).json({
        message: 'Unauthorized. Only admins and support managers can view assignable staff.'
      });
      return;
    }

    // Get query parameters for filtering
    const { search, role } = req.query;

    // Build filter - use Prisma enum values for role
    const filter: any = {
  role: {
    in: [UserRole.ADMIN, UserRole.SUPPORT] // Use enum values
  }
};

    // Add role filter if specified
    if (role) {
      filter.role = role as string;
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get staff members with their assignment counts
    const staff = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedComplaints: {
              where: {
                status: {
                  in: ['PENDING', 'IN_PROGRESS']
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate workload distribution
    const totalActiveComplaints = await prisma.complaint.count({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    });

    // Return list with sorted by least assigned
    const staffWithMetrics = staff.map((member: { _count: { assignedComplaints: number; }; }) => ({
      ...member,
      activeComplaints: member._count.assignedComplaints,
      workloadPercentage: totalActiveComplaints > 0 
        ? (member._count.assignedComplaints / totalActiveComplaints) * 100 
        : 0
    }));

    // Sort by active complaints count (ascending)
    staffWithMetrics.sort((a: { activeComplaints: number; }, b: { activeComplaints: number; }) => a.activeComplaints - b.activeComplaints);

    res.status(200).json({
      staff: staffWithMetrics
    });
    return;
  } catch (error) {
    console.error('Error fetching assignable staff:', error);
    res.status(500).json({
      message: 'Failed to fetch assignable staff',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
    return;
  }
},

  /**
   * Bulk assign complaints to balance workload
   */
balanceWorkload: async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is authorized
      const userRole = (req as any).user?.role;
      if (!['ADMIN', 'SUPPORT_MANAGER'].includes(userRole)) {
        res.status(403).json({
          message: 'Unauthorized. Only admins and support managers can balance workload.'
        });
        return;
      }

      // Get unassigned complaints
      const unassignedComplaints = await prisma.complaint.findMany({
        where: {
          assigneeId: null,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'asc'  // Oldest first
        }
      });

      if (unassignedComplaints.length === 0) {
        res.status(200).json({
          message: 'No unassigned complaints to distribute',
          assignmentsCount: 0
        });
        return;
      }

      // Get available support staff with current workload
      const supportStaff = await prisma.user.findMany({
        where: {
          role: {
            in: ['SUPPORT']
          }
        },
        include: {
          _count: {
            select: {
              assignedComplaints: {
                where: {
                  status: {
                    in: ['PENDING', 'IN_PROGRESS']
                  }
                }
              }
            }
          }
        },
        orderBy: {
  assignedComplaints: {
    _count: 'asc'
  }
}
      });

      if (supportStaff.length === 0) {
        res.status(400).json({
          message: 'No support staff available for assignment'
        });
        return;
      }

      // Distribute complaints evenly among staff
      const assignments: { complaintId: string, assigneeId: string }[] = [];
      let staffIndex = 0;

      for (const complaint of unassignedComplaints) {
        // Assign to next staff member in the rotation
        const assignee = supportStaff[staffIndex];
        
        assignments.push({
          complaintId: complaint.id,
          assigneeId: assignee.id
        });
        
        // Move to next staff member, loop back to beginning if needed
        staffIndex = (staffIndex + 1) % supportStaff.length;
      }

      // Perform assignments in a transaction
      await prisma.$transaction(async (tx) => {
        for (const assignment of assignments) {
          const complaint = await tx.complaint.findUnique({
            where: { id: assignment.complaintId }
          });

          if (!complaint) continue;

          const assignee = await tx.user.findUnique({
            where: { id: assignment.assigneeId },
            select: { name: true }
          });

          // Update the complaint
          await tx.complaint.update({
            where: { id: assignment.complaintId },
            data: {
              assigneeId: assignment.assigneeId,
              status: 'IN_PROGRESS' // If you have a Prisma enum, use: status: Status.IN_PROGRESS
            }
          });

          // Create notification for assignee
          await tx.notification.create({
            data: {
              userId: assignment.assigneeId,
              message: `You've been assigned to complaint: ${complaint.title}`,
              type: 'ASSIGNED',
              isRead: false
            }
          });

          // Create notification for client
          await tx.notification.create({
            data: {
              userId: complaint.clientId,
              message: `Your complaint "${complaint.title}" has been assigned to ${assignee?.name || 'a support agent'}`,
              type: 'STATUS_UPDATED',
              isRead: false
            }
          });

          // Log the automated assignment
          await tx.activityLog.create({
            data: {
              userId: (req as any).user.id,
              action: 'AUTO_COMPLAINT_ASSIGNED',
              entityId: complaint.id,
              details: JSON.stringify({
                complaintId: complaint.id,
                complaintTitle: complaint.title,
                assigneeId: assignment.assigneeId,
                method: 'workload_balancing'
              })
            }
          });
        }
      });

      res.status(200).json({
        message: `${assignments.length} complaints have been assigned to balance workload`,
        assignmentsCount: assignments.length
      });
      return;
    } catch (error) {
      console.error('Error balancing workload:', error);
      res.status(500).json({
        message: 'Failed to balance workload',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },
  
  /**
   * Get assignment history for a complaint
   */
  // getAssignmentHistory: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { complaintId } = req.params;
      
  //     if (!complaintId) {
  //       res.status(400).json({ message: 'Complaint ID is required' });
  //       return;
  //     }
      
  //     // Get assignment history from activity logs
  //     const assignmentHistory = await prisma.activityLog.findMany({
  //       where: {
  //         entityId: complaintId,
  //         action: {
  //           in: ['COMPLAINT_ASSIGNED', 'AUTO_COMPLAINT_ASSIGNED']
  //         }
  //       },
  //       include: {
  //         user: {
  //           select: {
  //             id: true,
  //             name: true,
  //             role: true
  //           }
  //         }
  //       },
  //       orderBy: {
  //         createdAt: 'desc'
  //       }
  //     });
      
  //     res.status(200).json({
  //       complaintId,
  //       assignmentHistory
  //     });
  //     return;
  //   } catch (error) {
  //     console.error('Error getting assignment history:', error);
  //     res.status(500).json({
  //       message: 'Failed to get assignment history',
  //       error: error instanceof Error ? error.message : 'An unknown error occurred'
  //     });
  //     return;
  //   }
  // }
};

export default adminController;