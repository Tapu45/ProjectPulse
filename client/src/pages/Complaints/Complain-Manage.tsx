import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  AlertCircle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import api, { API_ROUTES } from "../../config/api";

// Types
type ComplaintStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "WITHDRAWN";
type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ComplaintCategory =
  | "TECHNICAL"
  | "BILLING"
  | "FEATURE_REQUEST"
  | "GENERAL"
  | "BUG"
  | "ACCOUNT";

type User = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

type Project = {
  id: string;
  name: string;
};

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: ComplaintCategory;
  createdAt: string;
  updatedAt: string;
  project: Project;
  client: User;
  assignee?: User;
  _count: {
    responses: number;
  };
};

type PaginationData = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};

type FilterState = {
  search: string;
  status: string;
  priority: string;
  category: string;
  projectId: string;
  assigneeId: string;
  startDate: string;
  endDate: string;
};

type AssignableStaff = {
  id: string;
  name: string;
  email: string;
  role: string;
  activeComplaints: number;
  workloadPercentage: number;
};


const AdminComplaintManagement: React.FC = () => {
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    priority: "",
    category: "",
    projectId: "",
    assigneeId: "",
    startDate: "",
    endDate: "",
  });
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: "",
    status: "",
    priority: "",
    category: "",
    projectId: "",
    assigneeId: "",
    startDate: "",
    endDate: "",
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(
    null
  );
   const [currentSlide, setCurrentSlide] = useState(0);

  // Queries
  const {
    data: complaintData,
    isLoading: isLoadingComplaints,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useQuery({
    queryKey: ["complaints", page, pageSize, sortBy, sortOrder, activeFilters],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
        ...activeFilters,
      };
      const response = await api.get(API_ROUTES.ISSUES.GET_ALL, { params });
      return response.data;
    },
  });

  // Projects query for filtering
  const { data: projectsData } = useQuery({
    queryKey: ["projects-dropdown"],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.PROJECTS.GET_ALL, {
        params: { limit: 100 }, // Get all for dropdown
      });
      return response.data;
    },
  });

  // Staff query for assignment
  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["assignable-staff"],
    queryFn: async () => {
      const response = await api.get(
        API_ROUTES.ASSIGNMENT.GET_ASSIGNABLE_STAFF
      );
      return response.data;
    },
  });

  // Complaint details query
  // Complaint details query
  const { data: complaintDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["complaint-details", expandedComplaint],
    queryFn: async () => {
      if (!expandedComplaint) return null;
      const response = await api.get(
        API_ROUTES.ISSUES.GET_BY_ID(expandedComplaint)
      );
      console.log("API response for complaint details:", response.data);
      // Return the data properly structured to match component expectations
      return { complaint: response.data };
    },
    enabled: !!expandedComplaint,
  });

  // Mutations
  const assignMutation = useMutation({
    mutationFn: async ({
      complaintId,
      assigneeId,
    }: {
      complaintId: string;
      assigneeId: string;
    }) => {
      return await api.post(API_ROUTES.ASSIGNMENT.ASSIGN, {
        complaintId,
        assigneeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });

  // Update complaint status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ComplaintStatus;
    }) => {
      return await api.put(API_ROUTES.ISSUES.UPDATE(id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setSelectedComplaints([]);
      setSelectAll(false);
    },
  });

  // Extract data
  const complaints: Complaint[] = complaintData?.complaints || [];
  const pagination: PaginationData = complaintData?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  };
  const projects = projectsData?.projects || [];
  const assignableStaff: AssignableStaff[] = staffData?.staff || [];

  // Effect to reset selection when page changes
  useEffect(() => {
    setSelectedComplaints([]);
    setSelectAll(false);
  }, [page, pageSize]);

  // Effect to handle select all
  useEffect(() => {
    if (selectAll && complaints.length > 0) {
      const allIds = complaints.map((c) => c.id);
      // Only update if the arrays are different to prevent infinite loop
      if (
        JSON.stringify(selectedComplaints.sort()) !==
        JSON.stringify(allIds.sort())
      ) {
        setSelectedComplaints(allIds);
      }
    } else if (
      !selectAll &&
      selectedComplaints.length === complaints.length &&
      complaints.length > 0
    ) {
      // Only clear if all were previously selected
      setSelectedComplaints([]);
    }
  }, [selectAll, complaints]);

  // Handlers
  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setPage(1); // Reset to first page
    setIsFilterMenuOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      status: "",
      priority: "",
      category: "",
      projectId: "",
      assigneeId: "",
      startDate: "",
      endDate: "",
    };

    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setPage(1);
    setIsFilterMenuOpen(false);
  };

  const toggleComplaintExpand = (id: string) => {
    setExpandedComplaint((currentId) => (currentId === id ? null : id));
  };

  const handleBulkStatusUpdate = (status: ComplaintStatus) => {
    if (selectedComplaints.length === 0) return;

    const promises = selectedComplaints.map((id) =>
      updateStatusMutation.mutateAsync({ id, status })
    );

    Promise.all(promises)
      .then(() => {
        // All updates completed
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        setSelectedComplaints([]);
        setSelectAll(false);
      })
      .catch((error) => {
        console.error("Error updating statuses:", error);
      });
  };

  const toggleComplaintSelection = (id: string) => {
    setSelectedComplaints((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
    let badgeClass = "";

    switch (status) {
      case "PENDING":
        badgeClass = "bg-yellow-900/20 text-yellow-300";
        break;
      case "IN_PROGRESS":
        badgeClass = "bg-blue-900/20 text-blue-300";
        break;
      case "RESOLVED":
        badgeClass = "bg-green-900/20 text-green-300";
        break;
      case "CLOSED":
        badgeClass = "bg-gray-700/20 text-gray-300";
        break;
      case "WITHDRAWN":
        badgeClass = "bg-red-900/20 text-red-300";
        break;
      default:
        badgeClass = "bg-gray-700/20 text-gray-300";
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge: React.FC<{ priority: ComplaintPriority }> = ({
    priority,
  }) => {
    let badgeClass = "";

    switch (priority) {
      case "LOW":
        badgeClass = "bg-gray-700/20 text-gray-300";
        break;
      case "MEDIUM":
        badgeClass = "bg-blue-900/20 text-blue-300";
        break;
      case "HIGH":
        badgeClass = "bg-orange-900/20 text-orange-300";
        break;
      case "CRITICAL":
        badgeClass = "bg-red-900/20 text-red-300";
        break;
      default:
        badgeClass = "bg-gray-700/20 text-gray-300";
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Complaint Management
            </h1>
            <p className="text-gray-400 mt-1">
              {pagination.total > 0
                ? `${pagination.total} complaints found`
                : "No complaints found"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => refetchComplaints()}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <RefreshCcw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`px-4 py-2 ${
                isFilterMenuOpen
                  ? "bg-[#00f697] text-gray-900"
                  : "bg-gray-700 text-white"
              } rounded-lg flex items-center`}
            >
              <Filter size={16} className="mr-2" />
              Filters
              <ChevronDown size={16} className="ml-2" />
            </button>

            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 rounded-lg"
            >
              Apply
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Clear
            </button>
          </div>

          {/* Filter dropdown */}
          {isFilterMenuOpen && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              {/* Priority filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
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
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                >
                  <option value="">All Categories</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="BILLING">Billing</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="GENERAL">General</option>
                  <option value="BUG">Bug</option>
                  <option value="ACCOUNT">Account</option>
                </select>
              </div>

              {/* Project filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) =>
                    handleFilterChange("projectId", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                >
                  <option value="">All Projects</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date filters */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bulk action bar - visible when items are selected */}
        {selectedComplaints.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="font-medium">{selectedComplaints.length}</span>{" "}
              complaints selected
            </div>
            <div className="flex gap-2">
              {/* Status update buttons */}
              <button
                onClick={() => handleBulkStatusUpdate("IN_PROGRESS")}
                className="px-3 py-1.5 bg-blue-900/20 text-blue-300 rounded-lg text-sm hover:bg-blue-800/30"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("RESOLVED")}
                className="px-3 py-1.5 bg-green-900/20 text-green-300 rounded-lg text-sm hover:bg-green-800/30"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("CLOSED")}
                className="px-3 py-1.5 bg-gray-700/20 text-gray-300 rounded-lg text-sm hover:bg-gray-600/30"
              >
                Mark Closed
              </button>

              {/* Clear selection */}
              <button
                onClick={() => {
                  setSelectedComplaints([]);
                  setSelectAll(false);
                }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                <X size={14} className="inline mr-1" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoadingComplaints && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00f697]" />
          </div>
        )}

        {/* Error state */}
        {complaintsError && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed to load complaints. Please try again.
            </p>
          </div>
        )}

        {/* No results */}
        {!isLoadingComplaints &&
          complaints.length === 0 &&
          !complaintsError && (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No complaints found
              </h3>
              <p className="text-gray-400 mb-6">
                There are no complaints matching your criteria.
              </p>
            </div>
          )}

        {/* Complaints table */}
        {!isLoadingComplaints && complaints.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-800 text-gray-300 text-sm">
                  <tr>
                    <th className="p-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={() => setSelectAll(!selectAll)}
                          className="rounded bg-gray-700 border-gray-600 text-[#00f697] mr-2 focus:ring-[#00f697]"
                        />
                        <button
                          onClick={() => handleSort("title")}
                          className="flex items-center font-medium"
                        >
                          Title
                          {sortBy === "title" && (
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-[#00f697]"
                            />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="p-3 text-left"></th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => handleSort("priority")}
                        className="flex items-center font-medium"
                      >
                        Priority
                        {sortBy === "priority" && (
                          <ArrowUpDown
                            size={14}
                            className="ml-1 text-[#00f697]"
                          />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => handleSort("clientId")}
                        className="flex items-center font-medium"
                      >
                        Client
                        {sortBy === "clientId" && (
                          <ArrowUpDown
                            size={14}
                            className="ml-1 text-[#00f697]"
                          />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-left">Assignee</th>
                    <th className="p-3 text-left">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center font-medium"
                      >
                        Created
                        {sortBy === "createdAt" && (
                          <ArrowUpDown
                            size={14}
                            className="ml-1 text-[#00f697]"
                          />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {complaints.map((complaint) => (
                    <React.Fragment key={complaint.id}>
                      <tr
                        className={`border-b ${
                          expandedComplaint === complaint.id
                            ? "border-gray-600 bg-gray-800/70"
                            : "border-gray-700"
                        } hover:bg-gray-800/50`}
                      >
                        <td className="p-3">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={selectedComplaints.includes(
                                complaint.id
                              )}
                              onChange={() =>
                                toggleComplaintSelection(complaint.id)
                              }
                              className="mt-1 rounded bg-gray-700 border-gray-600 text-[#00f697] mr-2 focus:ring-[#00f697]"
                            />
                            <div>
                              <div
                                className="font-medium text-white hover:text-[#00f697] cursor-pointer flex items-center"
                                onClick={() =>
                                  toggleComplaintExpand(complaint.id)
                                }
                              >
                                {complaint.title}
                                {expandedComplaint === complaint.id ? (
                                  <ChevronUp
                                    size={16}
                                    className="ml-2 text-gray-400"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="ml-2 text-gray-400"
                                  />
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {complaint._count.responses > 0 && (
                                  <span className="flex items-center">
                                    <MessageCircle size={12} className="mr-1" />
                                    {complaint._count.responses} responses
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td className="p-3">
                          <PriorityBadge priority={complaint.priority} />
                        </td>
                        <td className="p-3">
                          <div className="max-w-[150px] truncate">
                            {complaint.project.name}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">
                              {complaint.client.name.charAt(0)}
                            </div>
                            <div className="max-w-[120px] truncate">
                              {complaint.client.name}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {complaint.assignee ? (
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-green-900/20 flex items-center justify-center text-xs mr-2">
                                {complaint.assignee.name.charAt(0)}
                              </div>
                              <div className="max-w-[120px] truncate">
                                {complaint.assignee.name}
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignMutation.mutate({
                                      complaintId: complaint.id,
                                      assigneeId: e.target.value,
                                    });
                                  }
                                }}
                                className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white w-28"
                                disabled={
                                  assignMutation.isPending &&
                                  assignMutation.variables?.complaintId ===
                                    complaint.id
                                }
                              >
                                <option value="">Assign to...</option>
                                {!isLoadingStaff &&
                                  assignableStaff.map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                      {staff.name} (
                                      {Math.round(staff.workloadPercentage)}%)
                                    </option>
                                  ))}
                              </select>
                              {assignMutation.isPending &&
                                assignMutation.variables?.complaintId ===
                                  complaint.id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#00f697]" />
                                  </div>
                                )}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-sm">
                            <Calendar
                              size={14}
                              className="mr-1 text-gray-400"
                            />
                            {formatDate(complaint.createdAt)}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {expandedComplaint === complaint.id && (
                        <tr className="bg-gray-900/50">
                          <td colSpan={8} className="p-0">
                            <div className="p-4 border-l-2 border-[#00f697] ml-3">
                              {isLoadingDetails ? (
                                <div className="flex justify-center py-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-[#00f697]" />
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Description */}
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                                      Description
                                    </h4>
                                    <div className="bg-gray-800 p-3 rounded-lg text-sm whitespace-pre-wrap">
                                      {complaintDetails?.complaint
                                        ?.description || complaint.description}
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-400 mb-1">
                                        Status
                                      </h4>
                                      <div className="flex items-center">
                                        <StatusBadge
                                          status={
                                            complaintDetails?.complaint
                                              ?.status || complaint.status
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-400 mb-1">
                                        Priority
                                      </h4>
                                      <PriorityBadge
                                        priority={
                                          complaintDetails?.complaint
                                            ?.priority || complaint.priority
                                        }
                                      />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-400 mb-1">
                                        Created
                                      </h4>
                                      <div className="text-sm text-gray-300">
                                        {formatDateTime(
                                          complaintDetails?.complaint
                                            ?.createdAt || complaint.createdAt
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-400 mb-1">
                                        Updated
                                      </h4>
                                      <div className="text-sm text-gray-300">
                                        {formatDateTime(
                                          complaintDetails?.complaint
                                            ?.updatedAt || complaint.updatedAt
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                 {/* Attachments section with slideshow functionality */}
<div>
  <h4 className="text-sm font-medium text-gray-400 mb-2">Attachments</h4>
  
  {(!complaintDetails?.complaint?.attachments || complaintDetails.complaint.attachments.length === 0) ? (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
      <FileText className="h-12 w-12 text-gray-600 mb-2" />
      <p className="text-sm text-gray-400">No attachments available</p>
    </div>
  ) : (
    <>
      {/* Slideshow component for image attachments */}
      {(() => {
        // State for tracking current slide
       
        const imageAttachments = complaintDetails.complaint.attachments.filter((attachment: any) => 
          (attachment.filePath || attachment.url)?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        const nonImageAttachments = complaintDetails.complaint.attachments.filter((attachment: any) => 
          !(attachment.filePath || attachment.url)?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
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
          <>
            {imageAttachments.length > 0 && (
              <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50 mb-4">
                {/* Image slideshow */}
                <div className="relative">
                  {imageAttachments.map((attachment: any, index: number) => (
                    <div 
                      key={attachment.id}
                      className={`transition-opacity duration-300 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0 hidden'
                      }`}
                    >
                      <div className="flex items-center justify-between p-2 px-4 bg-gray-800/90">
                        <p className="text-sm text-gray-300">
                          {attachment.fileName || attachment.filename || 'Image'}
                        </p>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-2">
                            {currentSlide + 1} / {imageAttachments.length}
                          </span>
                          <a
                            href={attachment.filePath || attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-[#00f697]"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="h-[500px] flex items-center justify-center bg-black/30 overflow-hidden">
                        <img 
                          src={attachment.filePath || attachment.url}
                          alt={attachment.fileName || attachment.filename || 'Image preview'}
                          className="max-w-full max-h-[500px] object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' ry='2'/%3E%3Cline x1='12' y1='6' x2='12' y2='18'/%3E%3Cline x1='6' y1='12' x2='18' y2='12'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Navigation arrows */}
                  {imageAttachments.length > 1 && (
                    <>
                      <button 
                        onClick={prevSlide} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={nextSlide} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-none"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Thumbnail navigation for multiple images */}
                {imageAttachments.length > 1 && (
                  <div className="p-2 bg-gray-800/90 border-t border-gray-700 overflow-x-auto">
                    <div className="flex gap-2">
                      {imageAttachments.map((attachment: any, index: number) => (
                        <button 
                          key={attachment.id}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded border ${
                            index === currentSlide 
                              ? 'border-[#00f697]' 
                              : 'border-gray-700'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        >
                          <img 
                            src={attachment.filePath || attachment.url}
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
            
            {/* Non-image attachments */}
            {nonImageAttachments.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {nonImageAttachments.map((attachment: any) => (
                  <div key={attachment.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-300">
                          {attachment.fileName || attachment.filename || 'Attachment'}
                        </p>
                      </div>
                      <a
                        href={attachment.filePath || attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-[#00f697]"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    
                    <div className="mt-2 border border-gray-700 rounded-md p-6 bg-gray-800/50 flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">
                        {((attachment.filePath || attachment.url)?.split('.').pop()?.toUpperCase() || '')} file
                      </p>
                      <a 
                        href={attachment.filePath || attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md flex items-center"
                      >
                        Download <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}
    </>
  )}
</div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-between items-center mt-6">
              <div className="text-sm text-gray-400 mb-3 md:mb-0">
                Showing {Math.min((page - 1) * pageSize + 1, pagination.total)}{" "}
                to {Math.min(page * pageSize, pagination.total)} of{" "}
                {pagination.total} complaints
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center px-3 py-1.5 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>

                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.pages ||
                        Math.abs(p - page) <= 1
                    )
                    .reduce((result: (number | string)[], p, idx, array) => {
                      if (idx > 0 && array[idx - 1] !== p - 1) {
                        result.push("...");
                      }
                      result.push(p);
                      return result;
                    }, [])
                    .map((p, idx) =>
                      typeof p === "number" ? (
                        <button
                          key={idx}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-md text-sm ${
                            p === page
                              ? "bg-[#00f697] text-gray-900"
                              : "bg-gray-800 hover:bg-gray-700"
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span
                          key={idx}
                          className="px-2 py-1.5 text-gray-500 text-sm"
                        >
                          {p}
                        </span>
                      )
                    )}
                </div>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="flex items-center px-3 py-1.5 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

              <div className="hidden md:flex items-center ml-4">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminComplaintManagement;
