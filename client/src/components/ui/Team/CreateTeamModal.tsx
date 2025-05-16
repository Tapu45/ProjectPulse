import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  Loader2, 
  Users, 
  Search, 
  User, 
  Check, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { API_ROUTES } from '../../../config/api';

// Types
type FormData = {
  name: string;
  description: string;
};

type TeamMember = {
  userId: string;
  role: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
};

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; members: TeamMember[] }) => void;
  isLoading: boolean;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('MEMBER');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  // Fetch users for team member selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.ADMIN.GET_USERS);
      return response.data.data;
    },
    enabled: isOpen // Only fetch when modal is open
  });
  
  // Filter users based on search and existing members
  const filteredUsers = users?.filter(user => 
    !members.some(member => member.userId === user.id) && 
    (user.name.toLowerCase().includes(searchText.toLowerCase()) || 
     user.email.toLowerCase().includes(searchText.toLowerCase()))
  ) || [];
  
  // Reset form and members when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setMembers([]);
      setSearchText('');
      setSelectedRole('MEMBER');
    }
  }, [isOpen, reset]);
  
  // Add member to the team
  const addMember = (user: User) => {
    setMembers(prev => [...prev, { userId: user.id, role: selectedRole }]);
    setSearchText('');
    setShowUserDropdown(false);
  };
  
  // Remove member from the team
  const removeMember = (userId: string) => {
    setMembers(prev => prev.filter(member => member.userId !== userId));
  };
  
  // Handle form submission
  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      members
    });
  };
  
  // Common role options
  const roleOptions = [
    'LEAD',
    'DEVELOPER',
    'DESIGNER',
    'QA',
    'TESTER',
    'PRODUCT_MANAGER',
    'MEMBER'
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#00f697]" />
            Create New Team
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]`}
              placeholder="Enter team name"
              {...register('name', { required: 'Team name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              placeholder="Enter team description"
              {...register('description')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Team Members
            </label>
            
            {/* Member search and add UI */}
            <div className="mb-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                  />
                  {showUserDropdown && searchText.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-700 cursor-pointer"
                            onClick={() => addMember(user)}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white uppercase font-medium mr-3">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-900/30 text-purple-300' 
                                : user.role === 'SUPPORT' 
                                  ? 'bg-blue-900/30 text-blue-300'
                                  : 'bg-gray-700 text-gray-300'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400">No users found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    type="button"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white flex items-center justify-between min-w-[120px]"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  >
                    <span>{selectedRole}</span>
                    {showRoleDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showRoleDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg max-h-60 overflow-y-auto">
                      {roleOptions.map(role => (
                        <div
                          key={role}
                          className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleDropdown(false);
                          }}
                        >
                          <span className="text-white">{role}</span>
                          {selectedRole === role && <Check size={16} className="text-[#00f697]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Selected members list */}
            {members.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-750 border-b border-gray-700 text-sm font-medium text-gray-300">
                  Selected Members ({members.length})
                </div>
                <ul className="divide-y divide-gray-700 max-h-48 overflow-y-auto">
                  {members.map((member) => {
                    const user = users?.find(u => u.id === member.userId);
                    return (
                      <li key={member.userId} className="p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white uppercase font-medium mr-3">
                            {user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs rounded-full">
                            {member.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeMember(member.userId)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTeamModal;