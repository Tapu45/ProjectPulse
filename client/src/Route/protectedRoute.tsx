import { type ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { API_ROUTES } from '../config/api';

// Define type for user data
interface UserData {
  role: string;
  id?: string;
  name?: string;
  email?: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Use React Query to fetch and validate the current user
  const { isLoading, data: userData } = useQuery<UserData>({
    queryKey: ['currentUser', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await api.get(API_ROUTES.AUTH.CURRENT_USER);
      return response.data;
    },
    // Don't run the query if there's no token
    enabled: !!token,
    // Only retry once to avoid multiple failed attempts
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use useEffect for side effects instead of onSuccess/onError
  useEffect(() => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    if (!isLoading && !userData && token) {
      // Only clear if we tried loading and failed
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [isLoading, userData, token]);

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="spinner border-t-4 border-green-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  // If no token or query failed, redirect to login
  if (!token || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles are provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;