import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_ROUTES } from '../../../config/api';
import { AlertCircle, Loader2 } from 'lucide-react';

const EditComplaint = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  
  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.ISSUES.GET_BY_ID(id!));
      return response.data;
    },
    enabled: !!id
  });
  
  // Update form data when complaint is loaded
  useEffect(() => {
    if (complaint) {
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        category: complaint.category || '',
        priority: complaint.priority || ''
      });
      
      if (complaint.attachments) {
        setExistingAttachments(complaint.attachments);
      }
    }
  }, [complaint]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };
  
  // Update complaint mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api.put(API_ROUTES.ISSUES.UPDATE(id!), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['user-complaints'] });
      navigate('/complaints');
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    
    files.forEach(file => {
      data.append('attachments', file);
    });
    
    updateMutation.mutate(data);
  };
  
  // Prevent editing if status is not PENDING
  useEffect(() => {
    if (complaint && complaint.status !== 'PENDING') {
      navigate('/complaints');
    }
  }, [complaint, navigate]);
  
  if (isLoading) return (
    <div className="max-w-4xl mx-auto p-6 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#00f697]" />
    </div>
  );
  
  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Error loading complaint. This complaint cannot be edited or may not exist.</span>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Complaint</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="BUG">Bug</option>
                <option value="DELAY">Delay</option>
                <option value="QUALITY">Quality</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                required
              >
                <option value="">Select Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          
          {/* Existing attachments */}
          {existingAttachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Existing Attachments
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {existingAttachments.map(attachment => (
                  <div 
                    key={attachment.id}
                    className="flex items-center bg-gray-700 rounded p-2"
                  >
                    <span className="text-sm text-gray-300 truncate flex-1">
                      {attachment.fileName}
                    </span>
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[#00f697] text-xs"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Note: Current attachments will be preserved.
              </p>
            </div>
          )}
          
          {/* File uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Add Attachments (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Max 5 files. Supported formats: images, PDFs, documents.
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditComplaint;