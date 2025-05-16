import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, Check, X, Upload, Loader2, FileText } from 'lucide-react';
import api, { API_ROUTES } from '../../../config/api';
import { useToast } from '../../../Context/ToastContext';

type ComplaintFormValues = {
  projectId: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
};

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    complaints: number;
  };
};

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  
  // Form validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ComplaintFormValues>();
  
  // Fetch projects
 const { data, isLoading: loadingProjects } = useQuery<{
    projects: Project[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.PROJECTS.GET_ALL);
      return response.data;
    },
  });
  
  // Submit complaint
  const mutation = useMutation({
    mutationFn: async (data: ComplaintFormValues) => {
      // Create form data to handle file uploads
      const formData = new FormData();
      
      // Add form fields
      formData.append('projectId', data.projectId);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      
      // Add files
      files.forEach(file => {
        formData.append('attachments', file);
      });
      
      // POST to server
     // Line ~71: Change this
const response = await api.post(API_ROUTES.ISSUES.CREATE, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
      
      return response.data;
    },
   onSuccess: (data) => {
      // Show success toast and redirect
      showToast(`Complaint submitted successfully! ID: ${data.id}`, 'success');
      reset();
      setFiles([]);
      
      // Navigate after a short delay to ensure user sees the toast
      setTimeout(() => {
        navigate('/complaints');
      }, 1000);
    },
    onError: (error: any) => {
      // Show error toast
      const errorMessage = error?.response?.data?.message || 'Failed to submit complaint';
      showToast(errorMessage, 'error');
      console.error('Error creating complaint:', error);
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    const newErrors: string[] = [];
    const newFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB max
    
    // Validate files
    Array.from(fileList).forEach(file => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} exceeds the 5MB size limit.`);
      } else if (files.length + newFiles.length >= 5) {
        newErrors.push('Maximum 5 files allowed.');
      } else {
        newFiles.push(file);
      }
    });
    
    setFileErrors(newErrors);
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };
  
  // Remove file
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  // Submit handler
  const onSubmit = (data: ComplaintFormValues) => {
    mutation.mutate(data);
  };

   const projects = data?.projects || [];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Submit New Complaint</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selection */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-300 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              
             <select
    id="projectId"
    className={`w-full bg-gray-800 border ${errors.projectId ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
    {...register('projectId', { required: 'Project is required' })}
    disabled={loadingProjects}
  >
    <option value="">Select a project</option>
    {projects.map(project => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ))}
  </select>
              
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-500">{errors.projectId.message}</p>
              )}
              
              {loadingProjects && (
                <div className="mt-2 text-sm text-gray-400 flex items-center">
                  <Loader2 className="animate-spin h-3 w-3 mr-2" />
                  Loading projects...
                </div>
              )}
            </div>
            
            {/* Priority Selection */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              
             <select
  id="priority"
  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
  defaultValue="MEDIUM"
  {...register('priority')}
>
  <option value="LOW">Low</option>
  <option value="MEDIUM">Medium</option>
  <option value="HIGH">High</option>
  <option value="CRITICAL">Critical</option>
</select>
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            
            <input
              id="title"
              type="text"
              className={`w-full bg-gray-800 border ${errors.title ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
              placeholder="Enter a descriptive title"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 100, message: 'Title must be less than 100 characters' }
              })}
            />
            
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            
            <select
              id="category"
              className={`w-full bg-gray-800 border ${errors.category ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select a category</option>
              <option value="COMMUNICATION">Technical</option>
              <option value="QUALITY">QUALITY</option>
              <option value="DELAY">DELAY</option>
              <option value="BUG">BUG</option>
              <option value="OTHER">OTHER</option>
            </select>
            
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            
            <Controller
              name="description"
              control={control}
              rules={{ 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              }}
              render={({ field }) => (
                <textarea
                  id="description"
                  className={`w-full bg-gray-800 border ${errors.description ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697] min-h-[150px]`}
                  placeholder="Provide detailed information about your complaint..."
                  {...field}
                />
              )}
            />
            
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
         {/* Attachments */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Attachments (optional)
  </label>
  
  <div className="border border-dashed border-gray-700 rounded-lg p-4 bg-gray-800/50">
    <div className="flex items-center justify-center">
      <label className="w-full cursor-pointer">
        <div className="flex flex-col items-center justify-center py-6">
          <Upload className="h-10 w-10 text-gray-500 mb-2" />
          <p className="text-sm font-medium text-gray-400">
            Drag & drop files here, or click to select
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Max 5 files, 5MB each)
          </p>
        </div>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleFileChange} 
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          disabled={files.length >= 5}
        />
      </label>
    </div>
    
    {/* Display file errors */}
    {fileErrors.length > 0 && (
      <div className="mt-3 bg-red-900/30 border border-red-800 rounded-md p-2">
        {fileErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-400 flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ))}
      </div>
    )}
    
    {/* Display selected files with previews */}
    {files.length > 0 && (
      <div className="mt-4 space-y-4">
        <p className="text-sm font-medium text-gray-300">Selected files:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden"
            >
              {/* File preview */}
              <div className="relative">
                {file.type.startsWith('image/') ? (
                  <div className="h-40 bg-black/30 flex items-center justify-center">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      className="max-h-40 max-w-full object-contain"
                      onLoad={(e) => {
                        // Clean up object URL after loading
                        return () => URL.revokeObjectURL((e.target as HTMLImageElement).src);
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gray-900/50 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded-md">
                        {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Delete button as an overlay */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-red-900/80 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              </div>
              
              {/* File info */}
              <div className="p-2 border-t border-gray-700">
                <p className="text-sm text-gray-300 truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-6 py-2.5 bg-[#00f697] hover:bg-[#00e086] text-gray-900 font-medium rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateComplaint;