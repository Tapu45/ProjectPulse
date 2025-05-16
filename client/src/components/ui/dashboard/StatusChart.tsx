// src/components/dashboard/StatusChart.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface StatusData {
  status: string;
  count: number;
}

export const StatusChart = () => {
  const [statusStats, setStatusStats] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusStats = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.STATUS_STATS);
        setStatusStats(response.data.statusStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load status statistics');
        setLoading(false);
      }
    };

    fetchStatusStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner border-t-4 border-green-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 rounded-lg bg-gray-800">{error}</div>;
  }

  // Color mapping for different status values
  const statusColors = {
    PENDING: '#ffbb33',
    IN_PROGRESS: '#33b5ff',
    RESOLVED: '#00f697',
    CLOSED: '#8855ff',
    ON_HOLD: '#ff5c33',
  };

  const data = {
    labels: statusStats.map(item => item.status),
    datasets: [
      {
        data: statusStats.map(item => item.count),
        backgroundColor: statusStats.map(item => 
          statusColors[item.status as keyof typeof statusColors] || '#00f697'
        ),
        borderColor: '#2d3748',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'white',
          padding: 15,
          boxWidth: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#00f697',
        bodyColor: 'white',
        borderColor: '#00f697',
        borderWidth: 1,
      },
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg h-80"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Issues By Status</h2>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </motion.div>
  );
};