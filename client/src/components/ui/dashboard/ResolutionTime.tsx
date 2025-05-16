// src/components/dashboard/ResolutionTime.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface ResolutionTimeData {
  averageResolutionTime: number;
  averageResolutionTimeByPriority: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  totalResolved: number;
}

export const ResolutionTime = () => {
  const [resolutionData, setResolutionData] = useState<ResolutionTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResolutionData = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.RESOLUTION_TIME);
        setResolutionData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load resolution time data');
        setLoading(false);
      }
    };

    fetchResolutionData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="spinner border-t-4 border-green-400 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error || !resolutionData) {
    return <div className="text-red-500 p-4 rounded-lg bg-gray-800">{error || 'No data available'}</div>;
  }

  const { averageResolutionTime, averageResolutionTimeByPriority, totalResolved } = resolutionData;

  const priorityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const priorityColors = {
    CRITICAL: 'rgba(255, 92, 51, 0.7)',
    HIGH: 'rgba(255, 187, 51, 0.7)',
    MEDIUM: 'rgba(0, 246, 151, 0.7)',
    LOW: 'rgba(0, 246, 151, 0.5)',
  };

  const data = {
    labels: priorityOrder,
    datasets: [
      {
        label: 'Average Resolution Time (Days)',
        data: priorityOrder.map(priority => 
          averageResolutionTimeByPriority[priority as keyof typeof averageResolutionTimeByPriority]
        ),
        backgroundColor: priorityOrder.map(priority => 
          priorityColors[priority as keyof typeof priorityColors]
        ),
        borderColor: priorityOrder.map(priority => 
          priority === 'CRITICAL' || priority === 'HIGH' ? 
          priorityColors[priority as keyof typeof priorityColors].replace('0.7', '1') : 
          '#00f697'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
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
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toFixed(1)} days`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Resolution Time Analysis</h2>
        <div className="bg-gray-700 px-3 py-1 rounded-full">
          <span className="text-sm text-gray-300">Total Resolved: </span>
          <span className="text-sm font-bold text-white">{totalResolved}</span>
        </div>
      </div>
      
      <div className="mb-4 bg-gray-700 p-4 rounded-lg">
        <div className="text-sm text-gray-300">Average Resolution Time</div>
        <div className="text-3xl font-bold" style={{ color: '#00f697' }}>
          {averageResolutionTime.toFixed(1)} <span className="text-lg text-gray-400">days</span>
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
};