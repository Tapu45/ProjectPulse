import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, PlusCircle, ListFilter, CheckCircle, LayoutGrid, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { API_ROUTES } from '../../config/api';
import UserComplain from '../../components/ui/complain/UserComplain';
import CreateComplain from '../../components/ui/complain/CreateComplain';

type Tab = 'list' | 'create';

interface ComplaintStats {
  total: number;
  resolved: number;
  closed: number;
  inProgress: number;
  pending: number;
  withdrawn: number;
}

const ComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial active tab based on route or set 'list' as default
  const initialTab: Tab = location.pathname.includes('/create') ? 'create' : 'list';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  
  // Fetch complaint statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<ComplaintStats>({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.ISSUES.GET_COMPLAINT_STATS);
      return response.data;
    },
    enabled: activeTab === 'list', // Only fetch when list tab is active
  });
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    
    // Update URL without refreshing the page
    if (tab === 'create') {
      navigate('/complaints/create', { replace: true });
    } else {
      navigate('/complaints', { replace: true });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Complaints Management</h1>
        <p className="text-gray-400 mt-2">
          Submit and track your complaints in one place
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => handleTabChange('list')}
          className={`px-4 py-2.5 flex items-center rounded-md ${
            activeTab === 'list'
              ? 'bg-[#00f697] text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-white'
          } transition-colors duration-200`}
        >
          <ListFilter size={18} className="mr-2" />
          <span className="font-medium">My Complaints</span>
        </button>
        
        <button
          onClick={() => handleTabChange('create')}
          className={`px-4 py-2.5 flex items-center rounded-md ${
            activeTab === 'create'
              ? 'bg-[#00f697] text-gray-900 shadow-sm'
              : 'text-gray-300 hover:text-white'
          } transition-colors duration-200`}
        >
          <PlusCircle size={18} className="mr-2" />
          <span className="font-medium">New Complaint</span>
        </button>
      </div>
      
      {/* Stats Overview */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FileText className="h-6 w-6 text-blue-400" />}
            title="Total Complaints"
            value={isLoadingStats ? 
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" /> : 
              (stats?.total || 0).toString()
            }
            bgColor="bg-blue-900/20"
            borderColor="border-blue-800"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-green-400" />}
            title="Resolved"
            value={isLoadingStats ? 
              <Loader2 className="h-5 w-5 animate-spin text-green-400" /> : 
              ((stats?.resolved || 0) + (stats?.closed || 0)).toString()
            }
            bgColor="bg-green-900/20"
            borderColor="border-green-800"
          />
          <StatCard
            icon={<LayoutGrid className="h-6 w-6 text-purple-400" />}
            title="In Progress"
            value={isLoadingStats ? 
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" /> : 
              (stats?.inProgress || 0).toString()
            }
            bgColor="bg-purple-900/20"
            borderColor="border-purple-800"
          />
        </div>
      )}
      
      {/* Content Area */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UserComplain />
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CreateComplain />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, bgColor, borderColor }) => {
  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 flex items-center`}>
      <div className="p-3 mr-4 rounded-full bg-gray-800">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h4 className="mt-1 text-xl font-semibold text-white">
          {value}
        </h4>
      </div>
    </div>
  );
};

export default ComplaintsPage;