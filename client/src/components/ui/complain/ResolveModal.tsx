import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { XCircle, Loader2, Check, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ROUTES } from '../../../config/api';

type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  project: {
    name: string;
  };
  client: {
    name: string;
    email: string;
  };
  priority: string;
  category: string;
  attachments: {
    id: string;
    fileName: string;
    filePath: string;
  }[];
};

type ResolveComplaintModalProps = {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onResolved: () => void;
};

const ResolveComplaintModal = ({
  isOpen,
  onClose,
  complaint,
  onResolved
}: ResolveComplaintModalProps) => {
  const [resolutionComment, setResolutionComment] = useState('');
  const [error, setError] = useState('');

  const resolveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(
        API_ROUTES.ISSUES.UPDATE_STATUS(complaint.id),
        { resolutionComment }
      );
      return response.data;
    },
    onSuccess: () => {
      onResolved();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to resolve complaint');
    }
  });

  const handleResolve = async () => {
    if (!resolutionComment.trim()) {
      setError('Resolution comment is required');
      return;
    }

    resolveMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700 shadow-xl"
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Resolve Complaint</h2>
          <button
            onClick={onClose}
            disabled={resolveMutation.isPending}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Complaint summary */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between flex-wrap gap-2">
              <h3 className="text-lg font-medium text-white">{complaint.title}</h3>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-md border ${
                  complaint.priority === 'LOW' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  complaint.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  complaint.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {complaint.priority}
                </span>
                
                <span className="px-2 py-1 text-xs rounded-md border bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {complaint.category}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mt-2 line-clamp-2">{complaint.description}</p>
            
            <div className="mt-3 text-xs text-gray-400">
              <p>Project: <span className="text-gray-300">{complaint.project.name}</span></p>
              <p>Client: <span className="text-gray-300">{complaint.client.name}</span></p>
            </div>
            
            {/* Attachments */}
            {complaint.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Attachments:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {complaint.attachments.map(attachment => (
                    <a
                      key={attachment.id}
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 group"
                    >
                      <div className="relative flex-shrink-0 h-10 w-10 mr-2 bg-gray-700 rounded overflow-hidden border border-gray-600">
                        {attachment.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img 
                            src={attachment.filePath}
                            alt={attachment.fileName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'%3E%3C/path%3E%3Cpolyline points='13 2 13 9 20 9'%3E%3C/polyline%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-hidden">
                        <p className="text-sm text-gray-300 truncate group-hover:text-[#00f697]">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.filePath.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Resolution form */}
          <div>
            <label htmlFor="resolution" className="block text-sm font-medium text-gray-300 mb-1">
              Resolution Comment <span className="text-red-500">*</span>
            </label>
            
            <textarea
              id="resolution"
              className={`w-full bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697] min-h-[120px]`}
              placeholder="Describe how you resolved this complaint..."
              value={resolutionComment}
              onChange={(e) => {
                setResolutionComment(e.target.value);
                if (error) setError('');
              }}
              disabled={resolveMutation.isPending}
            />
            
            {error && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            <p>
              <strong className="text-gray-300">Note:</strong> This action will mark the complaint as resolved. The client will be notified about the resolution.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={resolveMutation.isPending}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
          
          <button
            onClick={handleResolve}
            disabled={resolveMutation.isPending || !resolutionComment.trim()}
            className={`px-4 py-2 bg-[#00f697] hover:bg-[#00e086] text-gray-900 font-medium rounded-lg flex items-center ${
              !resolutionComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {resolveMutation.isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Resolving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Mark as Resolved
              </>
            )}
          </button>
        </div>
        
        {resolveMutation.isSuccess && (
          <div className="mx-6 mb-6 p-3 bg-green-900/30 border border-green-800 rounded-md">
            <p className="text-sm text-green-400 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Complaint has been successfully resolved!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResolveComplaintModal;