import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api, { API_ROUTES } from '../../../config/api';

interface HeaderProps {
  toggleSidebar: () => void;
}

type Notification = {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  
  // Get user data with React Query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      return JSON.parse(userData);
    },
    staleTime: Infinity, // This data won't change while the app is running
  });

  // Get unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get recent notifications (limited to 5)
  const { data: recentNotifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['recent-notifications', showNotifications],
    queryFn: async () => {
      if (!showNotifications) return { data: [] };
      const response = await api.get(API_ROUTES.NOTIFICATIONS.GET_ALL, { 
        params: { limit: 5, isRead: 'false' } 
      });
      return response.data;
    },
    enabled: showNotifications,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPLAINT_SUBMITTED':
        return <AlertCircle className="h-4 w-4 text-blue-400" />;
      case 'STATUS_UPDATE':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'RESPONSE_ADDED':
        return <Bell className="h-4 w-4 text-purple-400" />;
      case 'COMPLAINT_RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  // Format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          {/* Search bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#00f697] placeholder-gray-400"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-lg hover:bg-gray-800 relative" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadData?.count > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#00f697] text-black text-xs rounded-full flex items-center justify-center">
                  {unreadData.count > 9 ? '9+' : unreadData.count}
                </span>
              )}
            </button>
            
            {/* Notification dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadData?.count > 0 && (
                      <span className="bg-[#00f697]/20 text-[#00f697] text-xs px-2 py-0.5 rounded-full">
                        {unreadData.count} unread
                      </span>
                    )}
                  </div>
                  
                  {/* Loading state */}
                  {loadingNotifications && (
                    <div className="p-4 text-center">
                      <div className="w-5 h-5 border-t-2 border-[#00f697] rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-gray-400 mt-2">Loading notifications...</p>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {!loadingNotifications && (!recentNotifications?.data || recentNotifications.data.length === 0) && (
                    <div className="p-4 text-center">
                      <Bell className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No new notifications</p>
                    </div>
                  )}
                  
                  {/* Notification items */}
                  {!loadingNotifications && recentNotifications?.data && recentNotifications.data.length > 0 && (
                    <div className="max-h-80 overflow-y-auto">
                      {recentNotifications.data.map((notif: Notification) => (
                        <div 
                          key={notif.id} 
                          className="px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-xs text-gray-200 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* View all link */}
                  <div className="px-4 py-2 border-t border-gray-700">
                    <Link 
                      to="/notifications" 
                      className="flex items-center justify-center text-sm text-[#00f697] hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          
          
          
          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-[#00f697] flex items-center justify-center text-black font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
              <ChevronDown size={16} className={`transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-xs bg-gray-700 text-[#00f697] rounded-md">
                      {user?.role}
                    </span>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-700">Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-700">Settings</Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;