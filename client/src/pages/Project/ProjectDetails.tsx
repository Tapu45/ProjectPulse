import React   from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Edit, 
  BarChart2, 
  Folder,  
  FileText, 
  Loader2, 
  AlertCircle,
  Calendar,
  ExternalLink,
  Globe
} from 'lucide-react';
import api, { API_ROUTES } from '../../config/api';

type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'WITHDRAWN';
type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Complaint {
  id: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    responses: number;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  deployUrl: string | null;
  createdAt: string;
  updatedAt: string;
  complaints: Complaint[];
  _count: {
    complaints: number;
  };
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch project details
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await api.get(API_ROUTES.PROJECTS.GET_BY_ID(id));
      return response.data;
    },
    enabled: !!id
  });
  
  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-500';
      case 'WITHDRAWN':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'LOW':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">Low</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300">Medium</span>;
      case 'HIGH':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-900 text-orange-300">High</span>;
      case 'CRITICAL':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-300">Critical</span>;
      default:
        return null;
    }
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00f697]" />
      </div>
    );
  }
  
  // Display error state
  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg">
          <p className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error instanceof Error ? error.message : 'Failed to load project details'}
          </p>
          <button 
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
          >
            <ChevronLeft size={16} className="mr-2" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/projects')}
            className="mb-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg flex items-center w-fit"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Projects
          </button>
          
          <div className="flex flex-wrap justify-between items-start">
            <div className="flex items-center">
              {/* Display project logo if available */}
              {project.logoUrl ? (
                <img 
                  src={project.logoUrl}
                  alt={`${project.name} logo`}
                  className="w-16 h-16 mr-4 rounded-lg object-contain bg-gray-700"
                />
              ) : (
                <div className="w-16 h-16 mr-4 rounded-lg bg-gray-700 flex items-center justify-center">
                  <Folder className="h-8 w-8 text-gray-500" />
                </div>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-400 mt-1 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Created on {formatDate(project.createdAt)}
                </p>
                
                {/* Display deploy URL if available */}
                {project.deployUrl && (
                  <a 
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-[#00f697] hover:underline text-sm"
                  >
                    <Globe size={14} className="mr-1" />
                    {new URL(project.deployUrl).hostname}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/projects/edit/${project.id}`)}
              className="mt-2 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Edit Project
            </button>
          </div>
        </div>
        
        {/* Project info and stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-medium text-white mb-3 flex items-center">
              <Folder className="h-5 w-5 mr-2 text-[#00f697]" />
              Project Details
            </h2>
            {project.description ? (
              <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
            
            {/* Add deployment information section */}
            {project.deployUrl && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-[#00f697]" />
                  Deployment
                </h3>
                <a 
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-white transition-colors"
                >
                  View Live Project
                  <ExternalLink size={14} className="ml-2" />
                </a>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-medium text-white mb-3 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-[#00f697]" />
              Quick Stats
            </h2>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-gray-400">Total Complaints:</span>
                <span className="text-white font-medium">{project._count.complaints}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white">{formatDate(project.updatedAt)}</span>
              </li>
              <ComplaintStatusGraph complaints={project.complaints} />
            </ul>
          </div>
        </div>
        
        {/* Recent complaints */}
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#00f697]" />
              Recent Complaints
            </h2>
            {project._count.complaints > 0 && (
              <button 
                onClick={() => navigate('/complaints', { state: { projectFilter: project.id } })}
                className="text-sm text-[#00f697] hover:underline"
              >
                View all
              </button>
            )}
          </div>
          
          {project.complaints.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No complaints found for this project</p>
              <button 
                onClick={() => navigate('/complaints/create', { state: { preSelectedProject: project.id } })}
                className="mt-4 px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 text-sm rounded-lg"
              >
                Submit a complaint for this project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="text-left text-gray-400 text-sm">
                  <tr>
                    <th className="pb-2 pl-2">Title</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Submitted by</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {project.complaints.map((complaint) => (
                    <tr 
                      key={complaint.id} 
                      className="border-t border-gray-700 hover:bg-gray-700/30 cursor-pointer"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                    >
                      <td className="py-3 pl-2">
                        <div className="font-medium text-white">{complaint.title}</div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(complaint.status)} mr-2`}></div>
                          <span>{complaint.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {getPriorityBadge(complaint.priority)}
                      </td>
                      <td className="py-3">{complaint.client.name}</td>
                      <td className="py-3">{formatDate(complaint.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Component for showing complaint status distribution
const ComplaintStatusGraph: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const statusCounts = complaints.reduce((acc: Record<string, number>, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {});
  
  const statuses: ComplaintStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'WITHDRAWN'];
  
  const getStatusLabel = (status: ComplaintStatus) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };
  
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      case 'WITHDRAWN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (complaints.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Status Distribution</h3>
      <div className="space-y-2">
        {statuses.map(status => (
          <div key={status} className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
            <div className="flex-1 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">{getStatusLabel(status)}</span>
                <span className="text-gray-300">{statusCounts[status] || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${getStatusColor(status)}`}
                  style={{
                    width: `${complaints.length ? ((statusCounts[status] || 0) / complaints.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;