// src/components/dashboard/CategoryChart.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import api,{ API_ROUTES } from '../../../config/api';

interface CategoryData {
  category: string;
  count: number;
}

export const CategoryChart = () => {
  const [categoryStats, setCategoryStats] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.CATEGORY_STATS);
        setCategoryStats(response.data.categoryStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load category statistics');
        setLoading(false);
      }
    };

    fetchCategoryStats();
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

  // Generate dynamic colors with the main color being #00f697
  const generateColors = (count: number) => {
    const colors = [];
    const mainColor = '#00f697';
    colors.push(mainColor);
    
    for (let i = 1; i < count; i++) {
      const opacity = 0.7 - (i * 0.1);
      colors.push(`rgba(0, 246, 151, ${opacity > 0.3 ? opacity : 0.3})`);
    }
    
    return colors;
  };

  const data = {
    labels: categoryStats.map(item => item.category),
    datasets: [
      {
        data: categoryStats.map(item => item.count),
        backgroundColor: generateColors(categoryStats.length),
        borderColor: '#2d3748',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
          font: {
            size: 12,
          },
          padding: 20,
        },
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
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-5 shadow-lg h-80"
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Issues By Category</h2>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </motion.div>
  );
};