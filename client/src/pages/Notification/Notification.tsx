import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Trash2, Bell, AlertCircle, CheckCheck, Loader2, Clock, Eye } from 'lucide-react';
import api, { API_ROUTES } from '../../config/api';

type Notification = {
  id: string;
  message: string;
  type: 'COMPLAINT_SUBMITTED' | 'STATUS_UPDATE' | 'RESPONSE_ADDED' | 'COMPLAINT_RESOLVED' | string;
  isRead: boolean;
  createdAt: string;
  userId: string;
};

type NotificationsResponse = {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const NotificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Get notifications with pagination and filtering
  const { data: notificationsData, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', currentPage, filter],
    queryFn: async () => {
      const isReadParam = filter === 'all' 
        ? undefined 
        : filter === 'read' ? 'true' : 'false';
      
      const params: Record<string, string> = { page: currentPage.toString() };
      if (isReadParam !== undefined) {
        params.isRead = isReadParam;
      }
      
      const response = await api.get(API_ROUTES.NOTIFICATIONS.GET_ALL, { params });
      return response.data;
    }
  });
  
  // Get unread count for the badge
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT);
      return response.data;
    }
  });
  
  // Mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => {
      return api.put(API_ROUTES.NOTIFICATIONS.MARK_AS_READ(id));
    },
    onSuccess: () => {
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });
  
  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      return api.put(API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_READ);
    },
    onSuccess: () => {
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });
  
  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => {
      return api.delete(API_ROUTES.NOTIFICATIONS.DELETE(id));
    },
    onSuccess: () => {
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });
  
  // Delete all read notifications
  const deleteAllReadMutation = useMutation({
    mutationFn: () => {
      return api.delete(API_ROUTES.NOTIFICATIONS.DELETE_ALL_READ);
    },
    onSuccess: () => {
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });
  
  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPLAINT_SUBMITTED':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      case 'STATUS_UPDATE':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'RESPONSE_ADDED':
        return <Bell className="h-5 w-5 text-purple-400" />;
      case 'COMPLAINT_RESOLVED':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // If today, show only time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            Notifications
            {unreadData?.count > 0 && (
              <span className="ml-3 bg-[#00f697] text-black text-xs px-2 py-1 rounded-full">
                {unreadData.count} new
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-1">
            Stay updated on your project activities
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || (unreadData?.count === 0)}
            className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </button>
          
          <button
            onClick={() => deleteAllReadMutation.mutate()}
            disabled={deleteAllReadMutation.isPending}
            className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-50"
          >
            {deleteAllReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear read notifications
          </button>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex space-x-1 mb-5 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'all' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'unread' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'read' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Read
        </button>
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
          <p>Failed to load notifications. Please try again.</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && notificationsData?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white">No notifications yet</h3>
          <p className="text-gray-400 mt-1 max-w-md">
            {filter === 'all' 
              ? "You don't have any notifications at the moment."
              : filter === 'unread'
                ? "You don't have any unread notifications."
                : "You don't have any read notifications."}
          </p>
        </div>
      )}
      
      {/* Notifications list */}
      {!isLoading && (notificationsData?.data ?? []).length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {notificationsData?.data?.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative flex items-start p-4 rounded-lg ${
                  notification.isRead ? 'bg-gray-800' : 'bg-gray-800/80 border-l-4 border-[#00f697]'
                }`}
              >
                <div className="mr-4">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    disabled={deleteNotificationMutation.isPending}
                    className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Pagination */}
      {notificationsData?.meta.totalPages || 0 > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: notificationsData?.meta?.totalPages ||1}, (_, i) => i + 1)
              .filter(page => (
                page === 1 || 
                page === notificationsData?.meta.totalPages || 
                Math.abs(page - currentPage) <= 1
              ))
              .reduce((acc: (number | string)[], page, i, filtered) => {
                if (i > 0 && filtered[i - 1] !== page - 1) {
                  acc.push('...');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md ${
                      page === currentPage
                        ? 'bg-[#00f697] text-black'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} className="px-3 py-2">
                    {page}
                  </span>
                )
              ))
            }
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, notificationsData?.meta.totalPages || 1))}
              disabled={currentPage === (notificationsData?.meta.totalPages || 1)}
              className="px-3 py-2 rounded-md bg-gray-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;