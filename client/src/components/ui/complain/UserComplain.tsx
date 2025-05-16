import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Loader2, 
  ChevronDown, 
  Filter, 
  Plus, 
  Calendar, 
  Circle, 
  MessageSquare,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Edit
} from 'lucide-react';
import api, { API_ROUTES } from '../../../config/api';

type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'WITHDRAWN';
type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ComplaintCategory = 'BUG' | 'DELAY' | 'QUALITY' | 'COMMUNICATION' | 'OTHER';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: ComplaintCategory;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
  responses?: {
    id: string;
    message: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      role: string;
    }
  }[];
  _count: {
    responses: number;
  };
  history?: {
    id: string;
    status: ComplaintStatus;
    message: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
      role: string;
    };
  }[];
  attachments?: {
    id: string;
    fileName: string;
    filePath: string;
  }[];
}

interface ComplaintsResponse {
  complaints: Complaint[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const MyComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    projectId: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch user complaints
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery<ComplaintsResponse>({
    queryKey: ['user-complaints', filters, page],
    queryFn: async () => {
      const params = { ...filters, page, limit: 10 };
      const response = await api.get(API_ROUTES.ISSUES.GET_USER_COMPLAINTS, { params });
      return response.data;
    }
  });

  // Handler for filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };
  
  // Handler for creating a new complaint
  const handleCreateComplaint = () => {
    navigate('/complaints/create');
  };
  
  // Get status icon and color
  const getStatusDetails = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING':
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 'IN_PROGRESS':
        return { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'bg-blue-500', text: 'text-blue-500' };
      case 'RESOLVED':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500', text: 'text-green-500' };
      case 'CLOSED':
        return { icon: <Circle className="h-4 w-4" />, color: 'bg-gray-500', text: 'text-gray-500' };
      case 'WITHDRAWN':
        return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500', text: 'text-red-500' };
      default:
        return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-gray-500', text: 'text-gray-500' };
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get priority badge
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
  
  // Get category badge
  const getCategoryBadge = (category: ComplaintCategory) => {
    switch (category) {
      case 'BUG':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-300">Bug</span>;
      case 'DELAY':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-300">Delay</span>;
      case 'QUALITY':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-900 text-purple-300">Quality</span>;
      case 'COMMUNICATION':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300">Communication</span>;
      case 'OTHER':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">Other</span>;
      default:
        return null;
    }
  };
  

type TimelineEventStatus = ComplaintStatus | 'CREATED' | 'UPDATE';

interface TimelineEvent {
  title: string;
  date: string;
  icon: React.ReactNode;
  description: string;
  status: TimelineEventStatus;
  user?: string;
}

const ComplaintTimeline = ({ complaint }: { complaint: Complaint }) => {
  const events: TimelineEvent[] = [];
  
  // Add creation event
  events.push({
    title: 'Complaint Created',
    date: complaint.createdAt,
    icon: <FileText className="h-4 w-4 text-[#00f697]" />,
    description: `You submitted: "${complaint.title}"`,
    status: 'CREATED'
  });

  // Use history data if available (preferred method)
  if (complaint.history && complaint.history.length > 0) {
    complaint.history.forEach(historyEntry => {
      // Skip the initial PENDING status if it happened immediately after creation
      // (within 1 minute) to avoid duplication
      if (historyEntry.status === 'PENDING' && 
          new Date(historyEntry.createdAt).getTime() - new Date(complaint.createdAt).getTime() < 60000) {
        return;
      }

      events.push({
        title: `Status Changed to ${historyEntry.status.replace('_', ' ')}`,
        date: historyEntry.createdAt,
        icon: getStatusIconForTimeline(historyEntry.status),
        description: historyEntry.message || getStatusDescription(historyEntry.status),
        status: historyEntry.status,
        user: historyEntry.createdBy?.name
      });
    });
  } 
  // Fallback to response parsing if no history is available
  else if (complaint.responses && complaint.responses.length > 0) {
    // Sort responses by date ascending
    const sortedResponses = [...complaint.responses]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Extract status changes from responses
    sortedResponses.forEach(response => {
      // Try to extract status from messages like "status changed to X"
      const statusChangeMatch = response.message.match(/status.*?changed.*?to.*?(PENDING|IN_PROGRESS|RESOLVED|CLOSED|WITHDRAWN)/i);
      
      if (statusChangeMatch) {
        const statusValue = statusChangeMatch[1].toUpperCase() as ComplaintStatus;
        
        events.push({
          title: `Status Changed to ${statusValue.replace('_', ' ')}`,
          date: response.createdAt,
          icon: getStatusIconForTimeline(statusValue),
          description: response.message,
          status: statusValue,
          user: response.user.name
        });
      } 
      // Add regular responses to the timeline
      else {
        events.push({
          title: `Response from ${response.user.name}`,
          date: response.createdAt,
          icon: <MessageSquare className="h-4 w-4 text-blue-400" />,
          description: response.message,
          status: 'UPDATE',
          user: response.user.name
        });
      }
    });
    
    // Add current status if not already represented in timeline
    const currentStatusInTimeline = events.some(event =>
      (event.status !== 'CREATED' && event.status !== 'UPDATE') && event.status === complaint.status
    );
    
    if (!currentStatusInTimeline) {
      events.push({
        title: `Current Status: ${complaint.status.replace('_', ' ')}`,
        date: complaint.updatedAt,
        icon: getStatusIconForTimeline(complaint.status),
        description: getStatusDescription(complaint.status),
        status: complaint.status
      });
    }
  }
  // If no history or responses, just add current status
  else if (complaint.status !== 'PENDING') {
    events.push({
      title: `Current Status: ${complaint.status.replace('_', ' ')}`,
      date: complaint.updatedAt,
      icon: getStatusIconForTimeline(complaint.status),
      description: getStatusDescription(complaint.status),
      status: complaint.status
    });
  }
  
  // Sort events strictly by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="mt-4 pl-4">
      <div className="relative border-l-2 border-gray-700 pl-6 py-2">
        {events.map((event, index) => (
          <div key={index} className="mb-8 relative">
            {/* Timeline dot */}
            <div className={`absolute -left-9 p-1 rounded-full border-2 ${
              event.status === 'CREATED' ? 'bg-gray-900 border-[#00f697]' :
              event.status === 'PENDING' ? 'bg-gray-900 border-yellow-500' :
              event.status === 'IN_PROGRESS' ? 'bg-gray-900 border-blue-500' :
              event.status === 'RESOLVED' ? 'bg-gray-900 border-green-500' :
              event.status === 'CLOSED' ? 'bg-gray-900 border-gray-500' :
              event.status === 'WITHDRAWN' ? 'bg-gray-900 border-red-500' :
              'bg-gray-900 border-gray-700'
            }`}>
              {event.icon}
            </div>
            
            {/* Event content */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-white">{event.title}</h4>
                <div className="text-xs text-gray-400">
                  <div>{formatDate(event.date)}</div>
                  <div>{formatTime(event.date)}</div>
                </div>
              </div>
              <p className="text-sm text-gray-300">{event.description}</p>
              {event.user && (
                <p className="text-xs text-gray-500 mt-2">By: {event.user}</p>
              )}
            </div>
            
            {/* Continuation line */}
            {index < events.length - 1 && (
              <div 
                className="absolute left-[-26px] top-[36px] h-[calc(100%-16px)] border-l-2 border-gray-700"
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get the appropriate icon for each status in the timeline
const getStatusIconForTimeline = (status: ComplaintStatus) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'IN_PROGRESS':
      return <Loader2 className="h-4 w-4 text-blue-500" />;
    case 'RESOLVED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'CLOSED':
      return <Circle className="h-4 w-4 text-gray-500" />;
    case 'WITHDRAWN':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

// Helper function to get a description for each status
const getStatusDescription = (status: ComplaintStatus) => {
  switch (status) {
    case 'PENDING':
      return 'Your complaint is waiting to be reviewed.';
    case 'IN_PROGRESS':
      return 'Your complaint is being actively worked on.';
    case 'RESOLVED':
      return 'Your complaint has been resolved successfully.';
    case 'CLOSED':
      return 'Your complaint has been closed.';
    case 'WITHDRAWN':
      return 'You have withdrawn this complaint.';
    default:
      return 'Status updated';
  }
};
// Add this function in your MyComplaints component
const handleEditComplaint = (id: string) => {
  navigate(`/complaints/edit/${id}`);
};
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with title and action buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Complaints</h1>
            <p className="text-gray-400 mt-1">
              View and track all complaints you've submitted
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            
            <button 
              onClick={handleCreateComplaint}
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium text-sm rounded-lg flex items-center"
            >
              <Plus size={16} className="mr-2" />
              New Complaint
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gray-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="BUG">Bug</option>
                    <option value="DELAY">Delay</option>
                    <option value="QUALITY">Quality</option>
                    <option value="COMMUNICATION">Communication</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Actions</label>
                  <button 
                    onClick={() => {
                      setFilters({
                        status: '',
                        category: '',
                        priority: '',
                        projectId: '',
                      });
                      setPage(1);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
              Failed to load your complaints. Please try again.
            </p>
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && data?.complaints.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No complaints found</h3>
            <p className="text-gray-400 mb-6">You haven't submitted any complaints yet.</p>
            <button 
              onClick={handleCreateComplaint}
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium text-sm rounded-lg inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Submit your first complaint
            </button>
          </div>
        )}
        
        {/* Complaints list */}
        {!isLoading && data?.complaints && data.complaints.length > 0 && (
          <div className="space-y-4">
            {data?.complaints.map((complaint) => (
              <div 
                key={complaint.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
              >
                {/* Complaint header */}
                <div 
                  className="p-4 flex flex-col sm:flex-row justify-between cursor-pointer"
                  onClick={() => setExpandedComplaint(expandedComplaint === complaint.id ? null : complaint.id)}
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusDetails(complaint.status).color}`}></div>
                      <h3 className="font-medium text-white">{complaint.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center"><Calendar size={12} className="mr-1" />{formatDate(complaint.createdAt)}</span>
                      <span>•</span>
                      <span>{complaint.project.name}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <FileText size={12} className="mr-1" /> {complaint._count.responses} responses
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                    {getCategoryBadge(complaint.category)}
                    {getPriorityBadge(complaint.priority)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusDetails(complaint.status).text} bg-opacity-20 ${getStatusDetails(complaint.status).color.replace('bg-', 'bg-opacity-20 bg-')}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedComplaint === complaint.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
                
                {/* Expanded complaint details */}
                <AnimatePresence>
                  {expandedComplaint === complaint.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-700 p-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
                          <p className="text-sm text-gray-400">{complaint.description}</p>
                        </div>
                         {complaint.attachments && complaint.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Attachments</h4>
          <AttachmentsGallery attachments={complaint.attachments} />
        </div>
      )}

                        {complaint.status === 'RESOLVED' && (
        <ResolutionApprovalPanel 
          complaint={complaint} 
          refetch={() => {
            // Trigger a refetch of the complaints data
            refetch();
          }} 
        />
      )}
                        
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Timeline</h4>
                        <ComplaintTimeline complaint={complaint} />
                        
                        <div className="mt-4 flex justify-end">
                         {complaint.status === 'PENDING' && (
          <button
            onClick={() => handleEditComplaint(complaint.id)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Complaint
          </button>
        )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
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
                    <span key={idx} className="px-3 py-2">
                      {p}
                    </span>
                  )
                )}
              
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ResolutionApprovalPanelProps {
  complaint: Complaint;
  refetch: () => void;
}

const ResolutionApprovalPanel: React.FC<ResolutionApprovalPanelProps> = ({ complaint, refetch }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
 const respondToResolutionMutation = useMutation({
  mutationFn: async ({ action, feedback }: { action: string; feedback: string }) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Make the API request with authorization header
    return await api.post(
      API_ROUTES.ISSUES.RESPOND_TO_RESOLUTION(complaint.id), 
      { action, feedback },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user-complaints'] });
    refetch();
    setIsSubmitting(false);
  },
  onError: (error) => {
    console.error('Error responding to resolution:', error);
    setIsSubmitting(false);
  }
});
  
  const handleResponse = (action: string) => {
    setIsSubmitting(true);
    respondToResolutionMutation.mutate({ action, feedback });
  };
  
  return (
    <div className="mt-4 bg-gray-850 rounded-lg border border-gray-700 p-4">
      <div className="mb-4 flex items-start">
        <div className="p-2 bg-yellow-900/30 rounded-full mr-3">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h4 className="font-medium text-white">Resolution Pending Your Approval</h4>
          <p className="text-gray-400 text-sm mt-1">
            Your complaint has been marked as resolved by support. 
            Please review the resolution and either approve to close the complaint 
            or reject if you need further assistance.
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Additional Feedback (Optional)
        </label>
        <textarea
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
          placeholder="Add any comments about this resolution..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResponse('REJECT')}
          disabled={isSubmitting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
        >
          {isSubmitting && respondToResolutionMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Reject Resolution
        </button>
        
        <button
          onClick={() => handleResponse('APPROVE')}
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
        >
          {isSubmitting && respondToResolutionMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Approve & Close
        </button>
      </div>
    </div>
  );
};

const AttachmentsGallery: React.FC<{ attachments: Complaint['attachments'] }> = ({ attachments }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!attachments || attachments.length === 0) return null;
  
  const imageAttachments = attachments.filter(attachment => 
    attachment.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );
  
  const nonImageAttachments = attachments.filter(attachment => 
    !attachment.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );
  
  const nextSlide = () => {
    setCurrentSlide(current => 
      current === imageAttachments.length - 1 ? 0 : current + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentSlide(current => 
      current === 0 ? imageAttachments.length - 1 : current - 1
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Image Attachments Slideshow */}
      {imageAttachments.length > 0 && (
        <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
          {/* Image slideshow */}
          <div className="relative">
            {imageAttachments.map((attachment, index) => (
              <div 
                key={attachment.id}
                className={`transition-opacity duration-300 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 hidden'
                }`}
              >
                <div className="flex items-center justify-between p-2 px-4 bg-gray-800/90">
                  <p className="text-sm text-gray-300">
                    {attachment.fileName || 'Image'}
                  </p>
                  <div className="flex items-center">
                    {imageAttachments.length > 1 && (
                      <span className="text-xs text-gray-400 mr-2">
                        {currentSlide + 1} / {imageAttachments.length}
                      </span>
                    )}
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-[#00f697]"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="h-[300px] flex items-center justify-center bg-black/30 overflow-hidden">
                  <img 
                    src={attachment.filePath}
                    alt={attachment.fileName || 'Image preview'}
                    className="max-w-full max-h-[300px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'/%3E%3Cline x1='12' y1='6' x2='12' y2='18'/%3E%3Cline x1='6' y1='12' x2='18' y2='12'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Navigation arrows for multiple images */}
            {imageAttachments.length > 1 && (
              <>
                <button 
                  onClick={prevSlide} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextSlide} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail navigation for multiple images */}
          {imageAttachments.length > 1 && (
            <div className="p-2 bg-gray-800/90 border-t border-gray-700 overflow-x-auto">
              <div className="flex gap-2">
                {imageAttachments.map((attachment, index) => (
                  <button 
                    key={attachment.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-12 w-16 flex-shrink-0 overflow-hidden rounded border ${
                      index === currentSlide 
                        ? 'border-[#00f697]' 
                        : 'border-gray-700'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img 
                      src={attachment.filePath}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'/%3E%3Cline x1='12' y1='6' x2='12' y2='18'/%3E%3Cline x1='6' y1='12' x2='18' y2='12'/%3E%3C/svg%3E";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Non-image attachments list */}
      {nonImageAttachments.length > 0 && (
        <div className="space-y-3">
          {nonImageAttachments.map((attachment) => (
            <div key={attachment.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-300">
                    {attachment.fileName || 'File'}
                  </p>
                </div>
                <a
                  href={attachment.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-md flex items-center"
                >
                  Download <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {attachment.filePath.split('.').pop()?.toUpperCase()} File
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;