import { Request, Response } from 'express';
import { PrismaClient } from '../../prisma/prisma/generated/client';
import { upload , uploadToCloudinary} from '../utils/cloudinary';

const prisma = new PrismaClient();

export const projectController = {
  /**
   * Get all projects with optional filtering and pagination
   */
  getAllProjects: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        search,
        page = 1, 
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      // Add search functionality if provided
      if (search) {
        filter.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Determine sort order
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;

      // Get total count for pagination
      const totalCount = await prisma.project.count({
        where: filter
      });

      // Get projects
     const projects = await prisma.project.findMany({
      where: filter,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        name: true, 
        description: true,
        logoUrl: true,     // Include the logo URL
        deployUrl: true,   // Include the deploy URL
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { complaints: true }
        }
      }
    });

      res.status(200).json({
        projects,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / Number(limit)),
          limit: Number(limit)
        }
      });
      return;
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        message: 'Failed to fetch projects',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

  /**
   * Get a specific project by ID along with its related complaints
   */
  getProjectById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          complaints: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
              client: {
                select: { id: true, name: true, email: true }
              },
              _count: {
                select: { responses: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit to recent 10 complaints
          },
          _count: {
            select: { complaints: true }
          }
        }
      });

      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.status(200).json(project);
      return;
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        message: 'Failed to fetch project',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },

  /**
   * Create a new project
   */
  createProject: [
    upload.single('logo'), // Add multer middleware to handle file upload
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { name, description, deployUrl } = req.body;

        // Validate required fields
        if (!name) {
          res.status(400).json({ 
            message: 'Project name is required'
          });
          return;
        }

        // Check for admin role
        const userRole = (req as any).user?.role;
        if (userRole !== 'ADMIN') {
          res.status(403).json({ message: 'Only administrators can create projects' });
          return;
        }

        let logoUrl = null;

        // Handle logo upload if a file was provided
        if (req.file) {
          try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, {
              folder: 'project_logos',
              resource_type: 'image'
            });
            
            logoUrl = result.secure_url;
          } catch (uploadError) {
            console.error('Error uploading logo:', uploadError);
            res.status(500).json({
              message: 'Failed to upload project logo',
              error: uploadError instanceof Error ? uploadError.message : 'An unknown error occurred'
            });
            return;
          }
        }

        // Create project with logo URL if available
        const project = await prisma.project.create({
          data: {
            name,
            description,
            logoUrl,
            deployUrl
          }
        });

        res.status(201).json({
          message: 'Project created successfully',
          project
        });
        return;
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
          message: 'Failed to create project',
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
        return;
      }
    }
  ],

  /**
   * Update an existing project
   */
 updateProject: [
    upload.single('logo'), // Add multer middleware to handle file upload
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { name, description, deployUrl, removeLogo } = req.body;

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
          where: { id }
        });

        if (!existingProject) {
          res.status(404).json({ message: 'Project not found' });
          return;
        }

        // Validate permissions
        const userRole = (req as any).user?.role;
        if (userRole !== 'ADMIN') {
          res.status(403).json({ message: 'Only administrators can update projects' });
          return;
        }

        let logoUrl = existingProject.logoUrl;

        // Handle logo removal if requested
        if (removeLogo === 'true') {
          logoUrl = null;
        }
        // Handle logo upload if a file was provided
        else if (req.file) {
          try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer, {
              folder: 'project_logos',
              resource_type: 'image'
            });
            
            logoUrl = result.secure_url;
          } catch (uploadError) {
            console.error('Error uploading logo:', uploadError);
            res.status(500).json({
              message: 'Failed to upload project logo',
              error: uploadError instanceof Error ? uploadError.message : 'An unknown error occurred'
            });
            return;
          }
        }

        // Update project
        const updatedProject = await prisma.project.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(deployUrl !== undefined && { deployUrl }),
            logoUrl
          }
        });

        res.status(200).json({
          message: 'Project updated successfully',
          project: updatedProject
        });
        return;
      } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
          message: 'Failed to update project',
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
        return;
      }
    }
  ],

  /**
   * Delete a project
   */
  deleteProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id },
        include: { complaints: true }
      });

      if (!existingProject) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      // Check permissions
      const userRole = (req as any).user?.role;
      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Only administrators can delete projects' });
        return;
      }

      // Check if project has complaints
      if (existingProject.complaints.length > 0) {
        res.status(400).json({ 
          message: 'Cannot delete project with existing complaints. Resolve or move complaints first.' 
        });
        return;
      }

      // Delete project
      await prisma.project.delete({
        where: { id }
      });

      res.status(200).json({ 
        message: 'Project deleted successfully' 
      });
      return;
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        message: 'Failed to delete project',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  },
  
  /**
   * Get projects statistics (for dashboard)
   */
  getProjectStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get total projects count
      const totalProjects = await prisma.project.count();
      
      // Get projects with complaint counts
      const projectsWithComplaintCounts = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { complaints: true }
          }
        },
        orderBy: {
          complaints: {
            _count: 'desc'
          }
        },
        take: 5 // Top 5 projects by complaint count
      });
      
      // Get status distribution by project
      const statusDistribution = await prisma.complaint.groupBy({
        by: ['projectId', 'status'],
        _count: true
      });
      
      // Process the data for easier frontend consumption
      const processedStatusData: Record<string, any> = {};
      
      for (const item of statusDistribution) {
        if (!processedStatusData[item.projectId]) {
          // Get the project name
          const project = await prisma.project.findUnique({
            where: { id: item.projectId },
            select: { name: true }
          });
          
          processedStatusData[item.projectId] = { 
            name: project?.name || 'Unknown Project',
            statuses: {} 
          };
        }
        
        processedStatusData[item.projectId].statuses[item.status] = item._count;
      }
      
      res.status(200).json({
        totalProjects,
        topProjects: projectsWithComplaintCounts,
        statusDistribution: Object.values(processedStatusData)
      });
      return;
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      res.status(500).json({
        message: 'Failed to fetch project statistics',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      return;
    }
  }
};

export default projectController;