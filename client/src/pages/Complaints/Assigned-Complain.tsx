import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, 
  Search, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  MessageSquare,
  Building,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ROUTES } from '../../config/api';
import ResolveComplaintModal from '../../components/ui/complain/ResolveModal';

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    organization: string;
  };
  attachments: {
    id: string;
    fileName: string;
    filePath: string;
  }[];
  _count: {
    responses: number;
  };
};

type StatusCount = {
  status: string;
  count: number;
};

const AssignedComplaints = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);

  // Fetch assigned complaints
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assignedComplaints', currentPage, selectedStatus, selectedPriority, selectedCategory, searchQuery, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedCategory) params.append('category', selectedCategory);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await api.get(`${API_ROUTES.ISSUES.GET_ASSIGNED_COMPLAINTS}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Assigned complaints response:', response.data);
      return response.data;
    },
    retry: 1,
  });

  // Toggle expanded view for a complaint
  const toggleComplaintDetails = (id: string) => {
    setExpandedComplaintId(expandedComplaintId === id ? null : id);
  };

  // Handle resolving a complaint
  const openResolveModal = (complaint: Complaint, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedComplaint(complaint);
    setResolveModalOpen(true);
  };

  const handleComplaintResolved = () => {
    refetch();
    setResolveModalOpen(false);
    setSelectedComplaint(null);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'RESOLVED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'CLOSED':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const complaints = data?.complaints || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };
  const statusCounts = data?.metrics?.statusCounts || [];

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Assigned Complaints</h1>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search complaints..."
                className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00f697] w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            
            {/* Filter button */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => {
            const statusData = statusCounts.find((s: StatusCount) => s.status === status);
            const count = statusData?.count || 0;
            
            return (
              <div 
                key={status}
                className={`p-4 rounded-lg border ${
                  selectedStatus === status 
                    ? 'border-[#00f697] bg-gray-800/70' 
                    : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800/70'
                } cursor-pointer`}
                onClick={() => setSelectedStatus(selectedStatus === status ? '' : status)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      {status === 'PENDING' ? 'Pending' : 
                       status === 'IN_PROGRESS' ? 'In Progress' : 
                       status === 'RESOLVED' ? 'Resolved' : 'Closed'}
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">{count}</h3>
                  </div>
                  <div className={`p-2 rounded-full ${getStatusColor(status).split(' ')[0]}`}>
                    {status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-300" />}
                    {status === 'IN_PROGRESS' && <Loader2 className="h-5 w-5 text-blue-300" />}
                    {status === 'RESOLVED' && <CheckCircle2 className="h-5 w-5 text-green-300" />}
                    {status === 'CLOSED' && <CheckCircle2 className="h-5 w-5 text-gray-300" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter section */}
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              
              {/* Priority filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="COMMUNICATION">Technical</option>
                  <option value="QUALITY">Quality</option>
                  <option value="DELAY">Delay</option>
                  <option value="BUG">Bug</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => {
                  setSelectedStatus('');
                  setSelectedPriority('');
                  setSelectedCategory('');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 text-[#00f697] animate-spin" />
              <span className="ml-2 text-gray-300">Loading complaints...</span>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center py-20 text-center px-4">
              <div>
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-white">Failed to load complaints</h3>
                <p className="text-gray-400 mt-1">There was an error loading your assigned complaints.</p>
                <button 
                  onClick={() => refetch()} 
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex justify-center items-center py-20 text-center px-4">
              <div>
                <FileText className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-white">No complaints assigned to you</h3>
                <p className="text-gray-400 mt-1">
                  {searchQuery || selectedStatus || selectedPriority || selectedCategory
                    ? "No complaints match your current filters"
                    : "You don't have any complaints assigned to you yet"}
                </p>
                {(searchQuery || selectedStatus || selectedPriority || selectedCategory) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('');
                      setSelectedPriority('');
                      setSelectedCategory('');
                    }} 
                    className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/60 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-8">
                      {/* Expand column */}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('title')}
                        className="flex items-center space-x-1 hover:text-white"
                      >
                        <span>Title</span>
                        {sortBy === 'title' && (
                          <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-white"
                      >
                        <span>Status</span>
                        {sortBy === 'status' && (
                          <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <button 
                        onClick={() => handleSort('priority')}
                        className="flex items-center space-x-1 hover:text-white"
                      >
                        <span>Priority</span>
                        {sortBy === 'priority' && (
                          <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      <button 
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 hover:text-white"
                      >
                        <span>Created</span>
                        {sortBy === 'createdAt' && (
                          <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {complaints.map((complaint: Complaint) => (
                    <>
                      <tr 
                        key={complaint.id}
                        className={`hover:bg-gray-700/40 transition-colors ${expandedComplaintId === complaint.id ? 'bg-gray-700/40' : ''}`}
                      >
                        <td className="pl-6 pr-2 py-4" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                            {expandedComplaintId === complaint.id ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <div className="text-sm font-medium text-white">{complaint.title}</div>
                          {complaint.attachments.length > 0 && (
                            <div className="flex items-center mt-1 text-xs text-gray-400">
                              <FileText className="h-3 w-3 mr-1" /> 
                              {complaint.attachments.length} attachment{complaint.attachments.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <div className="text-sm text-gray-300">{complaint.project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <div className="text-sm text-gray-300">{complaint.client.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">
                            {complaint.client.organization || complaint.client.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <span className={`px-2 py-1 text-xs rounded-md border ${getStatusColor(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <span className={`px-2 py-1 text-xs rounded-md border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell" onClick={() => toggleComplaintDetails(complaint.id)}>
                          <div className="text-sm text-gray-300">{formatDate(complaint.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                              <button
                                onClick={(e) => openResolveModal(complaint, e)}
                                className="px-3 py-1 text-xs bg-[#00f697]/10 hover:bg-[#00f697]/20 text-[#00f697] border border-[#00f697]/30 rounded-md"
                                title="Mark as Resolved"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expandable details row */}
                      {expandedComplaintId === complaint.id && (
                        <tr>
                          <td colSpan={8} className="px-0">
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-gray-700/30 border-y border-gray-700"
                              >
                                <div className="p-6">
                                  {/* Details header with close button */}
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">{complaint.title}</h3>
                                    <button
                                      onClick={() => setExpandedComplaintId(null)}
                                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </div>
                                  
                                  {/* Status badges */}
                                  <div className="flex flex-wrap gap-2 mb-6">
                                    <span className={`px-3 py-1 text-sm rounded-md border ${getStatusColor(complaint.status)}`}>
                                      {complaint.status === 'PENDING' && <Clock className="h-3.5 w-3.5 inline mr-1" />}
                                      {complaint.status === 'IN_PROGRESS' && <Loader2 className="h-3.5 w-3.5 inline mr-1" />}
                                      {complaint.status === 'RESOLVED' && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />}
                                      {complaint.status === 'CLOSED' && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />}
                                      {complaint.status}
                                    </span>
                                    
                                    <span className={`px-3 py-1 text-sm rounded-md border ${getPriorityColor(complaint.priority)}`}>
                                      {complaint.priority}
                                    </span>
                                    
                                    <span className="px-3 py-1 text-sm rounded-md border bg-purple-500/20 text-purple-300 border-purple-500/30">
                                      {complaint.category}
                                    </span>
                                  </div>
                                  
                                  {/* Main content in 2-column layout */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Description and timestamps */}
                                    <div className="lg:col-span-2 space-y-4">
                                      {/* Description */}
                                      <div>
                                        <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400 mb-2">Description</h4>
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap">
                                          {complaint.description}
                                        </div>
                                      </div>
                                      
                                      {/* Attachments */}
                                     
{complaint.attachments && complaint.attachments.length > 0 && (
  <div>
    <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400 mb-2">Attachments</h4>
    <div className="grid grid-cols-1 gap-4">
      {complaint.attachments.map((attachment) => (
        <div key={attachment.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-300">{attachment.fileName}</p>
            </div>
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
          
          {/* Full image preview section */}
          {attachment.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <div className="mt-2 border border-gray-700 rounded-md overflow-hidden bg-black/30">
              <a href={attachment.filePath} target="_blank" rel="noopener noreferrer">
                <img 
                  src={attachment.filePath}
                  alt={attachment.fileName}
                  className="w-full object-contain max-h-[500px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'/%3E%3Cline x1='12' y1='6' x2='12' y2='18'/%3E%3Cline x1='6' y1='12' x2='18' y2='12'/%3E%3C/svg%3E";
                  }}
                />
              </a>
            </div>
          ) : (
            <div className="mt-2 border border-gray-700 rounded-md p-6 bg-gray-800/50 flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-gray-500 mb-2" />
              <p className="text-sm text-gray-400">
                {attachment.filePath.split('.').pop()?.toUpperCase()} file
              </p>
              <a 
                href={attachment.filePath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md flex items-center"
              >
                Download <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
                                    </div>
                                    
                                    {/* Sidebar with metadata */}
                                    <div className="space-y-4">
                                      {/* Client information */}
                                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <div className="flex items-center mb-2">
                                          <User className="h-4 w-4 text-gray-500 mr-2" />
                                          <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400">Client</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-sm">
                                            <span className="text-gray-400">Name:</span>
                                            <span className="ml-2 text-gray-300">{complaint.client.name}</span>
                                          </div>
                                          <div className="text-sm">
                                            <span className="text-gray-400">Email:</span>
                                            <span className="ml-2 text-gray-300">{complaint.client.email}</span>
                                          </div>
                                          {complaint.client.organization && (
                                            <div className="text-sm">
                                              <span className="text-gray-400">Organization:</span>
                                              <span className="ml-2 text-gray-300">{complaint.client.organization}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Project information */}
                                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <div className="flex items-center mb-2">
                                          <Building className="h-4 w-4 text-gray-500 mr-2" />
                                          <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400">Project</h4>
                                        </div>
                                        <div className="text-sm">
                                          <span className="text-gray-400">Name:</span>
                                          <span className="ml-2 text-gray-300">{complaint.project.name}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Date information */}
                                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <div className="flex items-center mb-2">
                                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                          <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400">Dates</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="text-sm">
                                            <span className="text-gray-400">Created:</span>
                                            <span className="ml-2 text-gray-300">{formatDate(complaint.createdAt)}</span>
                                          </div>
                                          <div className="text-sm">
                                            <span className="text-gray-400">Updated:</span>
                                            <span className="ml-2 text-gray-300">{formatDate(complaint.updatedAt)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Responses count */}
                                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                        <div className="flex items-center">
                                          <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                                          <span className="text-gray-400 text-sm">Responses:</span>
                                          <span className="ml-2 text-white font-medium">{complaint._count.responses}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Actions */}
                                      {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                                        <button
                                          onClick={() => openResolveModal(complaint)}
                                          className="w-full px-4 py-2 bg-[#00f697] hover:bg-[#00e086] text-gray-900 font-medium rounded-lg flex items-center justify-center"
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Mark as Resolved
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && !isError && complaints.length > 0 && (
            <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} complaints
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-md text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-md text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Resolve Modal */}
      {selectedComplaint && (
        <ResolveComplaintModal
          isOpen={resolveModalOpen}
          onClose={() => {
            setResolveModalOpen(false);
            setSelectedComplaint(null);
          }}
          complaint={selectedComplaint}
          onResolved={handleComplaintResolved}
        />
      )}
    </div>
  );
};

export default AssignedComplaints;