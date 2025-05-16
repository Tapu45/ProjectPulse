// src/contexts/ToastContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (message: string, type: ToastType, duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  };

  const hideToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} hideToast={hideToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const Toast: React.FC<{ toast: ToastProps; hideToast: (id: string) => void }> = ({
  toast,
  hideToast,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      hideToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, hideToast]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gray-800 border-l-4 border-[#00f697]';
      case 'error':
        return 'bg-gray-800 border-l-4 border-red-500';
      case 'info':
        return 'bg-gray-800 border-l-4 border-blue-500';
      default:
        return 'bg-gray-800 border-l-4 border-gray-500';
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-[#00f697]" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`max-w-md shadow-lg rounded-lg overflow-hidden ${getToastStyles()}`}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0 mr-3">{getToastIcon()}</div>
        <div className="flex-1 pr-4">
          <p className="text-sm text-white">{toast.message}</p>
        </div>
        <button
          onClick={() => hideToast(toast.id)}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};