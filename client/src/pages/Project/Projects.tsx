import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowUpDown,
  AlertCircle,
  Loader2,
  FileText,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import api, { API_ROUTES } from '../../config/api';
import { useForm } from 'react-hook-form';

// Types
type Project = {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  deployUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    complaints: number;
  };
};

type ProjectsResponse = {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
};

type SortField = 'name' | 'createdAt' | 'complaints';
type SortOrder = 'asc' | 'desc';

type ProjectFormData = {
  name: string;
  description: string;
  deployUrl: string;
};

const ProjectsManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);
  
  // State for filtering, sorting, and pagination
  const [filters, setFilters] = useState({
    search: '',
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{field: SortField, order: SortOrder}>({
    field: 'createdAt',
    order: 'desc'
  });
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Fetch projects
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<ProjectsResponse>({
    queryKey: ['projects', filters, page, sort],
    queryFn: async () => {
      const params = { 
        ...filters, 
        page, 
        limit: 10,
        sortBy: sort.field,
        sortOrder: sort.order
      };
      const response = await api.get(API_ROUTES.PROJECTS.GET_ALL, { params });
      return response.data;
    },
  });
  
  // Mutations for create, update, and delete
 const createMutation = useMutation({
  mutationFn: async (data: FormData) => {
    return await api.post(API_ROUTES.PROJECTS.CREATE, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setIsCreateModalOpen(false);
  }
});
  
 const updateMutation = useMutation({
  mutationFn: async ({id, data}: {id: string, data: FormData}) => {
    return await api.put(API_ROUTES.PROJECTS.UPDATE(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setIsEditModalOpen(false);
    setSelectedProject(null);
  }
});
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(API_ROUTES.PROJECTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });
  
  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset pagination when searching
    refetch();
  };
  
  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

   useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role || null);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header section */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Projects Management</h1>
            <p className="text-gray-400">
              Create and manage projects for tracking complaints
            </p>
          </div>
          
         {(userRole === 'ADMIN' || userRole === 'SUPPORT') && (
    <button
      onClick={() => setIsCreateModalOpen(true)}
      className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center"
    >
      <Plus size={18} className="mr-2" />
      Create Project
    </button>
  )}
        </div>
        
        {/* Filters and search */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00f697]" />
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed to load projects. Please try again.
            </p>
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && data?.projects.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Folder className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
            <p className="text-gray-400 mb-6">There are no projects matching your criteria.</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium text-sm rounded-lg inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Create your first project
            </button>
          </div>
        )}
        
        {/* Projects table */}
        {!isLoading && (data?.projects ?? []).length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
      <thead className="bg-gray-800 text-gray-300 text-sm">
        <tr>
          <th className="text-left p-3 rounded-tl-lg">
            <button 
              className="flex items-center font-medium"
              onClick={() => handleSort('name')}
            >
              Project Name
              {sort.field === 'name' && (
                <ArrowUpDown size={16} className="ml-1 text-[#00f697]" />
              )}
            </button>
          </th>
          <th className="text-left p-3">Description</th>
          <th className="text-left p-3">
            <button 
              className="flex items-center font-medium"
              onClick={() => handleSort('createdAt')}
            >
              Created
              {sort.field === 'createdAt' && (
                <ArrowUpDown size={16} className="ml-1 text-[#00f697]" />
              )}
            </button>
          </th>
          <th className="text-left p-3">
            <button 
              className="flex items-center font-medium"
              onClick={() => handleSort('complaints')}
            >
              Complaints
              {sort.field === 'complaints' && (
                <ArrowUpDown size={16} className="ml-1 text-[#00f697]" />
              )}
            </button>
          </th>
          <th className="text-left p-3">Deployment</th>
       {(userRole === 'ADMIN' || userRole === 'SUPPORT') && (
            <th className="text-right p-3 rounded-tr-lg">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="text-gray-200">
        {data?.projects.map((project) => (
          <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-800">
            <td className="p-3">
              <div className="flex items-center">
                {project.logoUrl ? (
                  <img 
                    src={project.logoUrl} 
                    alt={`${project.name} logo`} 
                    className="w-8 h-8 mr-3 rounded object-contain bg-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 mr-3 rounded bg-gray-700 flex items-center justify-center">
                    <Folder size={16} className="text-gray-400" />
                  </div>
                )}
                <span className="font-medium text-white">{project.name}</span>
              </div>
            </td>
            <td className="p-3">
              <div className="line-clamp-2 text-gray-300">{project.description || 'No description'}</div>
            </td>
            <td className="p-3">{formatDate(project.createdAt)}</td>
            <td className="p-3">
              <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300">
                {project._count.complaints} complaints
              </div>
            </td>
            <td className="p-3">
              {project.deployUrl ? (
                <a 
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#00f697] hover:underline"
                >
                  View <ExternalLink size={14} className="ml-1" />
                </a>
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </td>
           {(userRole === 'ADMIN' || userRole === 'SUPPORT') && (
              <td className="p-3 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="p-1 hover:text-[#00f697]"
                    title="View details"
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1 hover:text-[#00f697]"
                    title="Edit project"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(project)}
                    className="p-1 hover:text-red-400" 
                    title="Delete project"
                    disabled={project._count.complaints > 0}
                  >
                    <Trash2 size={18} className={project._count.complaints > 0 ? "text-gray-500 cursor-not-allowed" : ""} />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
            
            {/* Pagination */}
            {(data?.pagination.pages ?? 0) > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {data?.pagination.pages && Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === data.pagination.pages || Math.abs(p - page) <= 1)
                      .reduce((result: (number | string)[], p, idx, array) => {
                        if (idx > 0 && array[idx - 1] !== p - 1) {
                          result.push('...');
                        }
                        result.push(p);
                        return result;
                      }, [])
                      .map((p, idx) => 
                        typeof p === 'number' ? (
                          <button
                            key={idx}
                            onClick={() => setPage(p)}
                            className={`px-3 py-2 rounded-md ${
                              p === page
                                ? 'bg-[#00f697] text-black'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={idx} className="px-2 py-2 text-gray-500">
                            {p}
                          </span>
                        )
                      )}
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(data?.pagination.pages ?? 1, p + 1))}
                    disabled={page === data?.pagination.pages}
                    className="flex items-center px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Create Project Modal */}
        <CreateProjectModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.status === 'pending'}
        />
        
        {/* Edit Project Modal */}
        <EditProjectModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          project={selectedProject}
          onSubmit={(data) => {
            if (selectedProject) {
              updateMutation.mutate({ id: selectedProject.id, data });
            }
          }}
          isLoading={updateMutation.status === 'pending'}
        />
        
        {/* Delete Project Modal */}
        <DeleteProjectModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          project={selectedProject}
          onConfirm={() => {
            if (selectedProject) {
              deleteMutation.mutate(selectedProject.id);
            }
          }}
          isLoading={deleteMutation.status === 'pending'}
        />
      </motion.div>
    </div>
  );
};


// Create Project Modal Component
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormData>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };
  
  const handleFormSubmit = (data: ProjectFormData) => {
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('name', data.name);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.deployUrl) {
      formData.append('deployUrl', data.deployUrl);
    }
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    onSubmit(formData);
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      reset(); // Reset form when modal closes
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [isOpen, reset]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-lg mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
              placeholder="Enter project name"
              {...register('name', { required: 'Project name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              placeholder="Enter project description"
              {...register('description')}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="deployUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Deployment URL
            </label>
            <input
              id="deployUrl"
              type="url"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              placeholder="https://example.com"
              {...register('deployUrl')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Logo
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="logo-upload"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white cursor-pointer"
              >
                Choose File
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-12 w-12 object-contain rounded-md bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No file chosen</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Project Modal Component
interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  project, 
  onSubmit, 
  isLoading 
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormData>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  };
  
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setRemoveLogo(true);
  };
  
  React.useEffect(() => {
    if (project && isOpen) {
      reset({
        name: project.name,
        description: project.description,
        deployUrl: project.deployUrl || ''
      });
      
      // Set logo preview if available
      if (project.logoUrl) {
        setLogoPreview(project.logoUrl);
      } else {
        setLogoPreview(null);
      }
      
      // Reset logo state
      setLogoFile(null);
      setRemoveLogo(false);
    }
  }, [project, isOpen, reset]);
  
  const handleFormSubmit = (data: ProjectFormData) => {
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('name', data.name);
    
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    
    if (data.deployUrl !== undefined) {
      formData.append('deployUrl', data.deployUrl);
    }
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    
    if (removeLogo) {
      formData.append('removeLogo', 'true');
    }
    
    onSubmit(formData);
  };
  
  if (!isOpen || !project) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-lg mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
              placeholder="Enter project name"
              {...register('name', { required: 'Project name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              placeholder="Enter project description"
              {...register('description')}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="deployUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Deployment URL
            </label>
            <input
              id="deployUrl"
              type="url"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              placeholder="https://example.com"
              {...register('deployUrl')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Logo
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="logo-upload-edit"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white cursor-pointer"
              >
                Change Logo
                <input
                  id="logo-upload-edit"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-12 w-12 object-contain rounded-md bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">
                  {removeLogo ? "Logo will be removed" : "No logo set"}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Project Modal Component
interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  project, 
  onConfirm,
  isLoading 
}) => {
  if (!isOpen || !project) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center mb-4 text-amber-500">
          <AlertTriangle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Delete Project</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete <span className="font-medium text-white">{project.name}</span>?
          This action cannot be undone.
        </p>
        
        {project._count.complaints > 0 && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 p-3 rounded mb-4">
            <p className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>
                This project has {project._count.complaints} complaints associated with it. 
                Please reassign or resolve these complaints first.
              </span>
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center"
            disabled={isLoading || project._count.complaints > 0}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Project
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectsManagement;