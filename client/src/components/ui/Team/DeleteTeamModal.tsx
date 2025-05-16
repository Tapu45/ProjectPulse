import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  _count: {
    members: number;
    projects: number;
  };
}

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({ isOpen, onClose, team, onConfirm, isLoading }) => {
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
          <h2 className="text-xl font-semibold text-white mb-2">Delete Team</h2>
          <p className="text-gray-400 max-w-sm">
            Are you sure you want to delete the team <span className="text-white font-medium">"{team.name}"</span>? 
            This action cannot be undone.
          </p>
        </div>
        
        {team._count.projects > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-300 p-4 rounded-lg mb-6">
            <p className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                This team has {team._count.projects} project{team._count.projects > 1 ? 's' : ''} assigned to it. 
                You must reassign these projects before deleting the team.
              </span>
            </p>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm flex justify-between">
            <span>Team members:</span> 
            <span className="text-white font-medium">{team._count.members}</span>
          </p>
          <p className="text-gray-300 text-sm flex justify-between mt-2">
            <span>Projects assigned:</span> 
            <span className="text-white font-medium">{team._count.projects}</span>
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
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center"
            disabled={isLoading || team._count.projects > 0}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Team
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteTeamModal;