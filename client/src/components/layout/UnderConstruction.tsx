import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Construction, ArrowLeft, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnderConstruction: React.FC = () => {
  const navigate = useNavigate();
  
  // Animated gear rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const gear1 = document.getElementById('gear1');
      const gear2 = document.getElementById('gear2');
      
      if (gear1 && gear2) {
        const currentRotation1 = Number(gear1.getAttribute('data-rotation') || 0);
        const currentRotation2 = Number(gear2.getAttribute('data-rotation') || 0);
        
        gear1.style.transform = `rotate(${currentRotation1 + 1}deg)`;
        gear1.setAttribute('data-rotation', String(currentRotation1 + 1));
        
        gear2.style.transform = `rotate(${currentRotation2 - 1}deg)`;
        gear2.setAttribute('data-rotation', String(currentRotation2 - 1));
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate random stars background
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 3;
      stars.push(
        <div 
          key={i}
          className="absolute rounded-full bg-white opacity-70"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`
          }}
        />
      );
    }
    return stars;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {generateStars()}
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <HardHat size={120} className="text-[#00f697] drop-shadow-[0_0_15px_rgba(0,246,151,0.5)]" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-0 right-0 -mr-3 -mt-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg"
            >
              Coming Soon
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Under Construction
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-gray-300 text-lg mb-3">
            We're working hard to finish the development of this page.
          </p>
          <p className="text-gray-400">
            Our team is actively building this feature to enhance your experience in ProjectPulse.
          </p>
        </motion.div>
        
        {/* Animated construction illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative h-40 mb-10 flex justify-center"
        >
          <div id="gear1" data-rotation="0" className="absolute left-1/2 top-1/2 -ml-16 -mt-16 text-gray-700">
            <Construction size={80} />
          </div>
          <div id="gear2" data-rotation="0" className="absolute left-1/2 top-1/2 ml-4 -mt-8 text-[#00f697]">
            <Construction size={64} />
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 w-full max-w-xs bg-gray-800 h-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 1, duration: 1.5 }}
              className="h-full bg-gradient-to-r from-[#00f697] to-[#00e088]"
            />
          </div>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors duration-200"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-3 bg-[#00f697] hover:bg-[#00e088] text-gray-900 font-medium rounded-lg flex items-center transition-colors duration-200"
          >
            <Timer size={18} className="mr-2" />
            Dashboard
          </button>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-4 text-center text-gray-500 text-sm"
      >
        Project Pulse © {new Date().getFullYear()} | Check back soon for updates
      </motion.div>
      
      {/* Add custom animation for the twinkling stars */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default UnderConstruction;