// src/components/dashboard/PriorityChart.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PolarArea } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface PriorityData {
  priority: string;
  count: number;
}

export const PriorityChart = () => {
  const [priorityStats, setPriorityStats] = useState<PriorityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriorityStats = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.PRIORITY_STATS);
        setPriorityStats(response.data.priorityStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load priority statistics');
        setLoading(false);
      }
    };

    fetchPriorityStats();
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

  // Color mapping for different priority values
  const priorityColors = {
    LOW: 'rgba(0, 246, 151, 0.5)',
    MEDIUM: 'rgba(0, 246, 151, 0.7)',
    HIGH: 'rgba(255, 187, 51, 0.7)',
    CRITICAL: 'rgba(255, 92, 51, 0.7)',
  };

  const data = {
    labels: priorityStats.map(item => item.priority),
    datasets: [
      {
        data: priorityStats.map(item => item.count),
        backgroundColor: priorityStats.map(item => 
          priorityColors[item.priority as keyof typeof priorityColors] || '#00f697'
        ),
        borderWidth: 2,
        borderColor: '#2d3748',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
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
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'white',
        },
        ticks: {
          color: 'white',
          backdropColor: 'transparent',
        },
      },
    },
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg h-80"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Issues By Priority</h2>
      <div className="h-64">
        <PolarArea data={data} options={options} />
      </div>
    </motion.div>
  );
};