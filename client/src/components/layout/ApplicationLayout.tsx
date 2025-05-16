import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/shared/Header';
import Sidebar from '../ui/shared/Sidebar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the viewport is mobile-sized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Check whenever window is resized
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Overlay to close sidebar when clicking outside on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div 
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${
          isSidebarOpen && !isMobile ? 'md:ml-64' : isMobile ? 'ml-0' : 'md:ml-20'
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-6 overflow-auto flex-grow max-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;