// src/components/dashboard/ComplaintsTrend.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface TrendData {
  month: string;
  count: number;
}

export const ComplaintsTrend = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.COMPLAINTS_TREND);
        setTrendData(response.data.monthlyTrend);
        setLoading(false);
      } catch (err) {
        setError('Failed to load trend data');
        setLoading(false);
      }
    };

    fetchTrendData();
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

  const data = {
    labels: trendData.map(item => item.month),
    datasets: [
      {
        label: 'New Issues',
        data: trendData.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(0, 246, 151, 0.1)',
        borderColor: '#00f697',
        tension: 0.4,
        pointBackgroundColor: '#00f697',
        pointBorderColor: '#1a202c',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#00f697',
        pointHoverBorderColor: 'white',
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
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} issues`;
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
          precision: 0,
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
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg h-96"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Issue Trends (Last 6 Months)</h2>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};