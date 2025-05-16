import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (id: string) => void;
  isLoading: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onConfirm, 
  isLoading 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-red-900/30 p-3 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Delete User</h2>
          <p className="text-gray-400 max-w-sm">
            Are you sure you want to delete user <span className="text-white font-medium">"{user.name}"</span>? 
            This action cannot be undone.
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm flex justify-between">
            <span>Name:</span> 
            <span className="text-white font-medium">{user.name}</span>
          </p>
          <p className="text-gray-300 text-sm flex justify-between mt-2">
            <span>Email:</span> 
            <span className="text-white font-medium">{user.email}</span>
          </p>
        </div>
        
        <div className="flex justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(user.id)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete User
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteUserModal;