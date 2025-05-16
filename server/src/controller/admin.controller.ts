import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import { UserRole } from '../types/prisma-enums';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { emailService } from '../utils/emailService';

const prisma = new PrismaClient();

const createTeamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }),
  description: z.string().optional(),
  members: z.array(z.object({
    userId: z.string().uuid({ message: "Invalid user ID" }),
    role: z.string().min(2, { message: "Role must be at least 2 characters" })
  })).optional()
});

// Validation schema for updating teams
const updateTeamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }).optional(),
  description: z.string().optional(),
});

// Validation schema for adding team members
const addTeamMemberSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" })
});
// Validation schema for creating users
const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  organization: z.string().optional(),
  role: z.enum(['CLIENT', 'ADMIN', 'SUPPORT'], { 
    errorMap: () => ({ message: "Role must be CLIENT, ADMIN, or SUPPORT" })
  })
});

// Add this validation schema at the top with your other schemas
const updateUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  organization: z.string().optional().nullable(),
  role: z.enum(['CLIENT', 'ADMIN', 'SUPPORT'], { 
    errorMap: () => ({ message: "Role must be CLIENT, ADMIN, or SUPPORT" })
  }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional()
});

export class AdminController {
  
  async createUser(req: Request, res: Response):Promise<void> {
    try {
      // Validate request body
      const validationResult = createUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
         res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationResult.error.errors
        });
        return;
      }
      
      const { email, name, password, organization, role } = validationResult.data;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
         res.status(409).json({
          success: false,
          message: "User with this email already exists"
        });
        return;
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          organization,
          role: role as UserRole,
        }
      });
      
      await emailService.sendWelcomeEmail(name, email, role as UserRole);
      
      // Return created user without password
      const { password: _, ...userWithoutPassword } = newUser;
      
       res.status(201).json({
        success: true,
        message: "User created successfully",
        data: userWithoutPassword
      });
      return;
    } catch (error) {
      console.error("Error creating user:", error);
       res.status(500).json({
        success: false,
        message: "An error occurred while creating the user"
      });
      return;
    }
  }
  
  /**
   * Gets all users or filters by role
   */
  async getUsers(req: Request, res: Response):Promise<void> {
    try {
      const { role } = req.query;
      
      const whereClause = role ? { role: role as UserRole } : {};
      
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          organization: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        }
      });
      
       res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users
      });
      return;
    } catch (error) {
      console.error("Error retrieving users:", error);
       res.status(500).json({
        success: false,
        message: "An error occurred while retrieving users"
      });
      return;
    }
  }

 async createTeam(req: Request, res: Response): Promise<void> {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: "Only administrators can create teams"
      });
      return;
    }
    
    // Validate request body
    const validationResult = createTeamSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
      return;
    }
    
    const { name, description, members } = validationResult.data;
    
    // Create team with members in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          name,
          description,
        }
      });
      
      // Add team members if provided
      if (members && members.length > 0) {
        for (const member of members) {
          // Add the member
          await tx.teamMember.create({
            data: {
              teamId: newTeam.id,
              userId: member.userId,
              role: member.role,
            }
          });
          
          // Create notification for the user - THIS IS THE MISSING PART
          await tx.notification.create({
            data: {
              userId: member.userId,
              message: `You've been added to the team: ${name} as ${member.role}`,
              type: 'TEAM_ADDED',
              isRead: false,
              metadata: JSON.stringify({
                teamId: newTeam.id,
                teamName: name,
                role: member.role,
                addedBy: (req as any).user.id
              })
            }
          });
        }
      }
      
      // Return the team with members
      return await tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  organization: true
                }
              }
            }
          }
        }
      });
    });
    
    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team
    });
    return;
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the team"
    });
    return;
  }
}
  
  /**
   * Get all teams with their members
   */
  async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await prisma.team.findMany({
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          projects: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          },
          _count: {
            select: {
              members: true,
              projects: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Teams retrieved successfully",
        data: teams
      });
      return;
    } catch (error) {
      console.error("Error retrieving teams:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while retrieving teams"
      });
      return;
    }
  }
  
  /**
   * Get a specific team by ID
   */
  async getTeamById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  organization: true
                }
              }
            }
          },
          projects: {
            select: {
              id: true,
              name: true,
              description: true,
              logoUrl: true,
              deployUrl: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  complaints: true
                }
              }
            }
          }
        }
      });
      
      if (!team) {
        res.status(404).json({
          success: false,
          message: "Team not found"
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: "Team retrieved successfully",
        data: team
      });
      return;
    } catch (error) {
      console.error("Error retrieving team:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while retrieving the team"
      });
      return;
    }
  }
  
  /**
   * Update a team's information
   */
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      const userRole = (req as any).user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: "Only administrators can update teams"
        });
        return;
      }
      
      const { id } = req.params;
      
      // Validate request body
      const validationResult = updateTeamSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationResult.error.errors
        });
        return;
      }
      
      const { name, description } = validationResult.data;
      
      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id }
      });
      
      if (!existingTeam) {
        res.status(404).json({
          success: false,
          message: "Team not found"
        });
        return;
      }
      
      // Update team
      const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description })
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Team updated successfully",
        data: updatedTeam
      });
      return;
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the team"
      });
      return;
    }
  }
  
  /**
   * Delete a team
   */
  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin
      const userRole = (req as any).user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: "Only administrators can delete teams"
        });
        return;
      }
      
      const { id } = req.params;
      
      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id },
        include: {
          projects: true
        }
      });
      
      if (!existingTeam) {
        res.status(404).json({
          success: false,
          message: "Team not found"
        });
        return;
      }
      
      // Check if team has projects
      if (existingTeam.projects.length > 0) {
        res.status(400).json({
          success: false,
          message: "Cannot delete team with assigned projects. Please reassign projects first."
        });
        return;
      }
      
      // Delete team and all members (cascade will handle members)
      await prisma.team.delete({
        where: { id }
      });
      
      res.status(200).json({
        success: true,
        message: "Team deleted successfully"
      });
      return;
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting the team"
      });
      return;
    }
  }
  
 /**
 * Add a member to a team
 */
async addTeamMember(req: Request, res: Response): Promise<void> {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: "Only administrators can modify team members"
      });
      return;
    }
    
    const { teamId } = req.params;
    
    // Validate request body
    const validationResult = addTeamMemberSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
      return;
    }
    
    const { userId, role } = validationResult.data;
    
    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!existingTeam) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
    
    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId
      }
    });
    
    if (existingMember) {
      res.status(409).json({
        success: false,
        message: "User is already a member of this team"
      });
      return;
    }
    
    // Use transaction to add member and create notification
    const result = await prisma.$transaction(async (tx) => {
      // Add user to team
      const teamMember = await tx.teamMember.create({
        data: {
          teamId,
          userId,
          role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
      
      // Create notification for the user
      await tx.notification.create({
        data: {
          userId: userId,
          message: `You've been added to the team: ${existingTeam.name} as ${role}`,
          type: 'TEAM_ADDED',
          isRead: false,
          metadata: JSON.stringify({
            teamId: teamId,
            teamName: existingTeam.name,
            role: role,
            addedBy: (req as any).user.id
          })
        }
      });
      
      
      return teamMember;
    });
    
    res.status(201).json({
      success: true,
      message: "Team member added successfully",
      data: result
    });
    return;
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the team member"
    });
    return;
  }
}

/**
 * Remove a member from a team
 */
async removeTeamMember(req: Request, res: Response): Promise<void> {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: "Only administrators can modify team members"
      });
      return;
    }
    
    const { teamId, memberId } = req.params;
    
    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!existingTeam) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }
    
    // Check if member exists
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId
      },
      include: {
        user: true
      }
    });
    
    if (!existingMember) {
      res.status(404).json({
        success: false,
        message: "Team member not found"
      });
      return;
    }
    
    // Use transaction to remove member and create notification
    await prisma.$transaction(async (tx) => {
      // Remove member from team
      await tx.teamMember.delete({
        where: {
          id: memberId
        }
      });
      
      // Create notification for the user
      await tx.notification.create({
        data: {
          userId: existingMember.userId,
          message: `You've been removed from the team: ${existingTeam.name}`,
          type: 'TEAM_REMOVED',
          isRead: false,
          metadata: JSON.stringify({
            teamId: teamId,
            teamName: existingTeam.name,
            removedBy: (req as any).user.id
          })
        }
      });
      
    });
    
    res.status(200).json({
      success: true,
      message: "Team member removed successfully"
    });
    return;
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing the team member"
    });
    return;
  }
}



// Add these methods to your AdminController class

/**
 * Update a user's information
 */
async updateUser(req: Request, res: Response): Promise<void> {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: "Only administrators can update users"
      });
      return;
    }
    
    const { id } = req.params;
    
    // Validate request body
    const validationResult = updateUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
      return;
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
    
    // Extract fields to update
    const { email, name, organization, role, password } = validationResult.data;
    
    // Check email uniqueness if it's being updated
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: "Email is already in use by another user"
        });
        return;
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (organization !== undefined) updateData.organization = organization;
    if (role) updateData.role = role;
    
    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    // Use transaction to update user and create log entry
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          organization: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: (req as any).user.id,
          action: 'USER_UPDATED',
          entityId: id,
          details: JSON.stringify({
            updatedFields: Object.keys(updateData),
            oldEmail: existingUser.email,
            oldName: existingUser.name,
            oldRole: existingUser.role,
            newEmail: email || existingUser.email,
            newName: name || existingUser.name,
            newRole: role || existingUser.role
          })
        }
      });
      
      // Create notification if role changed
      if (role && role !== existingUser.role) {
        await tx.notification.create({
          data: {
            userId: id,
            message: `Your account role has been updated from ${existingUser.role} to ${role}`,
            type: 'STATUS_UPDATED',
            isRead: false,
            metadata: JSON.stringify({
              oldRole: existingUser.role,
              newRole: role,
              updatedBy: (req as any).user.id
            })
          }
        });
      }
      
      return updatedUser;
    });
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result
    });
    return;
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user"
    });
    return;
  }
}

/**
 * Delete a user
 */
async deleteUser(req: Request, res: Response): Promise<void> {
  try {
    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: "Only administrators can delete users"
      });
      return;
    }
    
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        assignedComplaints: true,
        complaints: true,
        teams: {
          include: {
            team: true
          }
        }
      }
    });
    
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
    
    // Prevent deleting self
    if (id === (req as any).user.id) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
      return;
    }
    
    // Check if user has assigned complaints
    if (existingUser.assignedComplaints.length > 0) {
      res.status(400).json({
        success: false,
        message: "Cannot delete user with assigned complaints. Please reassign these complaints first."
      });
      return;
    }
    
    // Get user teams for notifications
    const userTeams = existingUser.teams.map(membership => ({
      teamId: membership.teamId,
      teamName: membership.team.name,
      role: membership.role
    }));
    
    // Use transaction for deletion and logging
    await prisma.$transaction(async (tx) => {
      // Remove user from all teams
      if (existingUser.teams.length > 0) {
        await tx.teamMember.deleteMany({
          where: { userId: id }
        });
        
        // Notify team admins about member removal
        for (const team of userTeams) {
          // Get team LEAD members to notify
          const teamLeads = await tx.teamMember.findMany({
            where: {
              teamId: team.teamId,
              role: 'LEAD'
            },
            select: {
              userId: true
            }
          });
          
          // Notify each team lead
          for (const lead of teamLeads) {
            await tx.notification.create({
              data: {
                userId: lead.userId,
                message: `${existingUser.name} has been removed from your team "${team.teamName}"`,
                type: 'TEAM_REMOVED',
                isRead: false,
                metadata: JSON.stringify({
                  teamId: team.teamId,
                  teamName: team.teamName,
                  removedUserId: id,
                  removedUserName: existingUser.name,
                  removedUserEmail: existingUser.email,
                  removedBy: (req as any).user.id
                })
              }
            });
          }
        }
      }
      
      // Delete user
      await tx.user.delete({
        where: { id }
      });
      
      // Log the activity
      await tx.activityLog.create({
        data: {
          userId: (req as any).user.id,
          action: 'USER_DELETED',
          entityId: id,
          details: JSON.stringify({
            deletedUserEmail: existingUser.email,
            deletedUserName: existingUser.name,
            deletedUserRole: existingUser.role,
            teamsCount: existingUser.teams.length,
            submittedComplaintsCount: existingUser.complaints.length
          })
        }
      });
    });
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
    return;
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user"
    });
    return;
  }
}
}