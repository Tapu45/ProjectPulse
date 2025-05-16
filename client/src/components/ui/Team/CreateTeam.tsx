import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  UserPlus, 
  UserX, 
  Loader2, 
  Calendar, 
  Briefcase, 
} from 'lucide-react';
import api, { API_ROUTES } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import CreateTeamModal from './CreateTeamModal';
import EditTeamModal from './EditTeamModal';
import DeleteTeamModal from './DeleteTeamModal';
import PageTitle from './PageTitle';
import { formatDistanceToNow } from 'date-fns';

// Types
interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    projects: number;
  };
  members: TeamMember[];
  projects: {
    id: string;
    name: string;
    logoUrl: string | null;
  }[];
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    organization?: string;
  };
}



const TeamsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch teams
  const { data: teams, isLoading, error } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get(API_ROUTES.ADMIN.GET_TEAMS);
      return response.data.data;
    }
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      return await api.post(API_ROUTES.ADMIN.CREATE_TEAM, teamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateModalOpen(false);
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(API_ROUTES.ADMIN.UPDATE_TEAM(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditModalOpen(false);
      setSelectedTeam(null);
    }
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(API_ROUTES.ADMIN.DELETE_TEAM(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    }
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      return await api.delete(API_ROUTES.ADMIN.REMOVE_TEAM_MEMBER(teamId, memberId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  // Filter teams based on search query
  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle team expansion
  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Modal handlers
  const openCreateModal = () => setIsCreateModalOpen(true);
  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  // Handle team member removal
  const handleRemoveMember = (teamId: string, memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      removeTeamMemberMutation.mutate({ teamId, memberId });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageTitle title="Team Management" icon={<Users className="h-6 w-6 text-[#00f697]" />} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        {/* Search and Create Team */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f697]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 rounded-lg flex items-center font-medium transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Team
          </button>
        </div>
        
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
              <p className="font-medium">Error loading teams</p>
              <p className="mt-1">Please try again or contact support if the problem persists.</p>
            </div>
          </div>
        )}
        
        {/* Teams List */}
        {!isLoading && filteredTeams && filteredTeams.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">No teams found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? "No teams match your search criteria." : "You haven't created any teams yet."}
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#00f697] hover:bg-[#00e088] text-gray-900 rounded-lg inline-flex items-center font-medium transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Team
            </button>
          </div>
        )}
        
        {!isLoading && filteredTeams && filteredTeams.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {filteredTeams.map(team => (
              <div key={team.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Team Header */}
                <div className="p-5 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                      {team.description && <p className="text-gray-400 mt-1">{team.description}</p>}
                      
                      <div className="flex flex-wrap items-center mt-3 text-sm text-gray-400">
                        <div className="flex items-center mr-4 mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center mr-4 mb-2">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{team._count.members} Members</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span>{team._count.projects} Projects</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(team)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Team"
                      >
                        <Edit2 className="h-5 w-5 text-gray-400 hover:text-[#00f697]" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(team)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete Team"
                        disabled={team._count.projects > 0}
                      >
                        <Trash2 className={`h-5 w-5 ${team._count.projects > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Team Members Toggle */}
                <button
                  onClick={() => toggleTeamExpansion(team.id)}
                  className="w-full flex justify-between items-center px-5 py-3 text-left bg-gray-750 hover:bg-gray-700 transition-colors"
                >
                  <span className="text-white font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Team Members
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedTeams[team.id] ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Team Members List */}
                {expandedTeams[team.id] && (
                  <div className="p-4 bg-gray-850">
                    {team.members.length === 0 ? (
                      <div className="text-center py-4 text-gray-400">
                        <UserPlus className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <p>No members yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead className="text-gray-400 text-sm">
                            <tr>
                              <th className="text-left pb-3 pl-3">Name</th>
                              <th className="text-left pb-3">Email</th>
                              <th className="text-left pb-3">Role</th>
                              <th className="text-left pb-3">Position</th>
                              <th className="text-right pb-3 pr-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.members.map(member => (
                              <tr key={member.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                                <td className="py-3 pl-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white uppercase font-medium mr-3">
                                      {member.user.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-white">{member.user.name}</span>
                                  </div>
                                </td>
                                <td className="py-3">{member.user.email}</td>
                                <td className="py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                    member.user.role === 'ADMIN' 
                                      ? 'bg-purple-900/30 text-purple-300' 
                                      : member.user.role === 'SUPPORT' 
                                        ? 'bg-blue-900/30 text-blue-300'
                                        : 'bg-gray-700 text-gray-300'
                                  }`}>
                                    {member.user.role}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs rounded-full">
                                    {member.role}
                                  </span>
                                </td>
                                <td className="py-3 pr-3 text-right">
                                  <button
                                    onClick={() => handleRemoveMember(team.id, member.id)}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="Remove member"
                                  >
                                    <UserX className="h-5 w-5 text-gray-400 hover:text-red-400" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Add Member Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center text-sm transition-colors"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Projects Info (if any) */}
                {team.projects && team.projects.length > 0 && (
                  <div className="px-5 py-4 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Assigned Projects</h4>
                    <div className="flex flex-wrap">
                      {team.projects.map(project => (
                        <div 
                          key={project.id}
                          className="flex items-center mr-4 mb-2 px-3 py-1.5 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.logoUrl ? (
                            <img 
                              src={project.logoUrl} 
                              alt={project.name} 
                              className="w-5 h-5 mr-2 rounded-sm" 
                            />
                          ) : (
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                          )}
                          <span className="text-sm text-white">{project.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data: any) => createTeamMutation.mutate(data)}
        isLoading={createTeamMutation.isPending}
      />
      
      {/* Edit Team Modal */}
      {selectedTeam && (
        <EditTeamModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
          onSubmit={(data: any) => updateTeamMutation.mutate({ id: selectedTeam.id, data })}
          isLoading={updateTeamMutation.isPending}
        />
      )}
      
      {/* Delete Team Modal */}
      {selectedTeam && (
        <DeleteTeamModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
          onConfirm={() => deleteTeamMutation.mutate(selectedTeam.id)}
          isLoading={deleteTeamMutation.isPending}
        />
      )}
    </div>
  );
};

export default TeamsPage;