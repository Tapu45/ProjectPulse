// src/components/dashboard/TopProjects.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface ProjectData {
  projectId: string;
  projectName: string;
  complaintCount: number;
}

export const TopProjects = () => {
  const [projectStats, setProjectStats] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.PROJECT_STATS);
        setProjectStats(response.data.projectStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load project statistics');
        setLoading(false);
      }
    };

    fetchProjectStats();
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

  // Sort projects by complaint count
  const sortedProjects = [...projectStats].sort((a, b) => b.complaintCount - a.complaintCount);

  const data = {
    labels: sortedProjects.map(item => item.projectName),
    datasets: [
      {
        label: 'Number of Issues',
        data: sortedProjects.map(item => item.complaintCount),
        backgroundColor: 'rgba(0, 246, 151, 0.6)',
        borderColor: '#00f697',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: '#00f697',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#00f697',
        bodyColor: 'white',
        borderColor: '#00f697',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          precision: 0,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    animation: {
      duration: 2000,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg h-96"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Top Projects by Issues</h2>
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
};