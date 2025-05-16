import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { 
  Users,
  UserPlus,
  User as UserIcon,
  Filter,
  Search,
  Trash2,
  Edit2,
  Mail,
  Shield,
  Clock,
  Building,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import api, { API_ROUTES } from '../../config/api';
import CreateTeam from '../../components/ui/Team/CreateTeam';
import { formatDistanceToNow } from 'date-fns';
import UserCreate from '../Auth/UserCreate';
import EditUserModal from './modal/EditUserModal';
import DeleteUserModal from './modal/DeleteUserModal';


// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.ADMIN.GET_USERS);
      return response.data.data;
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(API_ROUTES.ADMIN.UPDATE_USER(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(API_ROUTES.ADMIN.DELETE_USER(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  });

  // Filter users based on search query and role filter
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.organization && user.organization.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const roleColors: Record<string, { bg: string, text: string }> = {
    'CLIENT': { bg: 'bg-emerald-900/30', text: 'text-emerald-300' },
    'ADMIN': { bg: 'bg-purple-900/30', text: 'text-purple-300' },
    'SUPPORT': { bg: 'bg-blue-900/30', text: 'text-blue-300' }
  };

  // Modal handlers
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateUser = (id: string, data: any) => {
    updateUserMutation.mutate({ id, data });
  };

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <Tab.Group>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center mb-4 md:mb-0">
            <UserIcon className="h-6 w-6 mr-2 text-[#00f697]" />
            User Management
          </h1>
          
          <Tab.List className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
            <Tab className={({ selected }: { selected: boolean }) => 
              `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selected 
                ? 'bg-[#00f697] text-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`
            }>
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1.5" />
                Users
              </div>
            </Tab>
            <Tab className={({ selected }: { selected: boolean }) => 
              `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selected 
                ? 'bg-[#00f697] text-gray-900' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`
            }>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5" />
                Teams
              </div>
            </Tab>
          </Tab.List>
        </div>
        
        <Tab.Panels>
          {/* Users Panel */}
          <Tab.Panel>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
                  {/* Search */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name, email or organization..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Role Filter */}
                  <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#00f697]"
                      value={roleFilter || ''}
                      onChange={(e) => setRoleFilter(e.target.value || null)}
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPPORT">Support</option>
                      <option value="CLIENT">Client</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 rounded-lg flex items-center font-medium transition-colors"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New User
                  </button>
                </div>
              </div>
              
              {showCreateUser && (
                <div className="mb-8">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-white">Create New User</h2>
                      <button
                        onClick={() => setShowCreateUser(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <UserCreate onSuccess={() => {
                      setShowCreateUser(false);
                      queryClient.invalidateQueries({ queryKey: ['users'] });
                    }} />
                  </div>
                </div>
              )}
              
              {/* Loading and Error States */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00f697]" />
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading users</p>
                    <p className="mt-1">Please try again or contact support if the problem persists.</p>
                  </div>
                </div>
              )}

              {/* Mutation Error Messages */}
              {updateUserMutation.isError && (
                <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error updating user</p>
                    <p className="mt-1">An error occurred while trying to update the user.</p>
                  </div>
                </div>
              )}

              {deleteUserMutation.isError && (
                <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error deleting user</p>
                    <p className="mt-1">
                      An error occurred while trying to delete the user. 
                      The user may have assigned complaints or be part of a team.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Users Table */}
              {!isLoading && filteredUsers && (
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-750">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                              <div className="flex flex-col items-center">
                                <Search className="h-8 w-8 mb-2 text-gray-600" />
                                <p>No users found matching your search criteria.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-750">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white uppercase font-medium">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                    <div className="text-sm text-gray-400 flex items-center">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role].bg} ${roleColors[user.role].text}`}>
                                  <Shield className="h-3 w-3 mr-1" />
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-300">
                                  <Building className="h-4 w-4 mr-1 text-gray-400" />
                                  {user.organization || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-[#00f697] transition-colors"
                                    title="Edit user"
                                    onClick={() => openEditModal(user)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete user"
                                    onClick={() => openDeleteModal(user)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Tab.Panel>
          
          {/* Teams Panel */}
          <Tab.Panel>
            <CreateTeam />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleUpdateUser}
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* Delete User Modal */}
      {selectedUser && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={handleDeleteUser}
          isLoading={deleteUserMutation.isPending}
        />
      )}
    </motion.div>
  );
};

export default UserManagementPage;