// src/components/dashboard/StatsOverviewCard.tsx
import { useState, useEffect } from 'react';
import { FaTicketAlt, FaHourglass, FaSpinner, FaCheckCircle, FaArchive, FaExclamationTriangle } from 'react-icons/fa';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import api,{ API_ROUTES } from '../../../config/api';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800 rounded-lg p-5 shadow-lg border-l-4"
    style={{ borderLeftColor: color }}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          <CountUp end={value} duration={2.5} />
        </h3>
      </div>
      <div className="text-3xl" style={{ color }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export const StatsOverviewCard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    criticalComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.STATS);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="spinner border-t-4 border-green-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 rounded-lg bg-gray-800">{error}</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Issue Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Issues"
          value={stats.totalComplaints}
          icon={<FaTicketAlt />}
          color="#00f697"
        />
        <StatCard
          title="Pending"
          value={stats.pendingComplaints}
          icon={<FaHourglass />}
          color="#ffbb33"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressComplaints}
          icon={<FaSpinner />}
          color="#33b5ff"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedComplaints}
          icon={<FaCheckCircle />}
          color="#00f697"
        />
        <StatCard
          title="Closed"
          value={stats.closedComplaints}
          icon={<FaArchive />}
          color="#8855ff"
        />
        <StatCard
          title="Critical Issues"
          value={stats.criticalComplaints}
          icon={<FaExclamationTriangle />}
          color="#ff5c33"
        />
      </div>
    </div>
  );
};