import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  MessageSquare, 
  FileText,
  AlertCircle,
  LogOut,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  // Get user data with React Query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      return JSON.parse(userData);
    },
    // No need to refetch this data
    staleTime: Infinity,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavItems = () => {
   

    // Add role-specific items
    switch (user?.role) {
      case 'ADMIN':
        return [
         { to: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
         // { to: "/complaints", icon: <BarChart2 size={20} />, label: "Analytics" },
          { to: "/user-management", icon: <Users size={20} />, label: "Users" },
          
          { to: "/projects", icon: <FileText size={20} />, label: "Projects" },
          { to: "/complaints", icon: <AlertCircle size={20} />, label: "Complaints" },
          //{ to: "/settings", icon: <Settings size={20} />, label: "Settings" },
          { to: "/admin/complaints", icon: <FileText size={20} />, label: "Admin Complaints" },
        ];
      case 'CLIENT':
        return [
          
          { to: "/projects", icon: <FileText size={20} />, label: "Projects" },
          { to: "/complaints", icon: <AlertCircle size={20} />, label: "Complaints" },
          //{ to: "/calendar", icon: <Calendar size={20} />, label: "Schedule" },
        ];
      case 'SUPPORT':
        return [
         
          { to: "/projects", icon: <FileText size={20} />, label: "Projects" },
          { to: "/assigned-complaints", icon: <AlertCircle size={20} />, label: "Complaints" },
        ];
      default:
        return [
          
          { to: "/complaints", icon: <AlertCircle size={20} />, label: "My Complaints" },
          { to: "/messages", icon: <MessageSquare size={20} />, label: "Messages" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black z-20"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 z-30 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
        animate={{ width: isOpen ? 256 : 80 }}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-6">
          <div className="flex items-center text-[#00f697] font-bold">
            <Activity size={24} className="mr-3" />
            {isOpen && <span className="text-xl cursor-pointer" onClick={() => navigate('/')}>ProjectPulse</span>}
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden ml-auto p-2 rounded-full hover:bg-gray-800"
          >
            {isOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-colors duration-200 rounded-lg ${
                  isActive
                    ? 'bg-gray-800 text-[#00f697]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="min-w-[28px]">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User profile and logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#00f697] flex items-center justify-center text-black font-medium">
              {user?.name?.charAt(0) || "U"}
            </div>
            {isOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-4 flex items-center px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg w-full ${
              !isOpen && 'justify-center'
            }`}
          >
            <LogOut size={18} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;