// src/components/dashboard/WorkloadDistribution.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api,{ API_ROUTES } from '../../../config/api';
import { FaUserCog } from 'react-icons/fa';

interface SupportUser {
  userId: string;
  name: string;
  email: string;
  activeComplaints: number;
}

export const WorkloadDistribution = () => {
  const [workloadData, setWorkloadData] = useState<SupportUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkloadData = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.WORKLOAD);
        setWorkloadData(response.data.workloadDistribution);
        setLoading(false);
      } catch (err) {
        setError('Failed to load workload distribution data');
        setLoading(false);
      }
    };

    fetchWorkloadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="spinner border-t-4 border-green-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 rounded-lg bg-gray-800">{error}</div>;
  }

  if (!workloadData.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Support Team Workload</h2>
        <div className="text-gray-400 text-center py-10">No support team members found.</div>
      </div>
    );
  }

  const maxComplaints = Math.max(...workloadData.map(user => user.activeComplaints));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Support Team Workload</h2>
      <div className="space-y-4">
        {workloadData.map((user, index) => {
          const percentage = maxComplaints ? (user.activeComplaints / maxComplaints) * 100 : 0;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-gray-600 p-2 rounded-full mr-3">
                    <FaUserCog className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full">
                  <span className="text-white font-bold">{user.activeComplaints}</span>
                  <span className="text-gray-400 text-sm ml-1">active</span>
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <motion.div 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: percentage > 75 ? '#ff5c33' : percentage > 50 ? '#ffbb33' : '#00f697',
                    width: `${percentage}%` 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};