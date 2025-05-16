import React from 'react';
import { motion } from 'framer-motion';

export const ProjectPulseAnimation: React.FC = () => {
  return (
    <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(to_right,#101010_1px,transparent_1px),linear-gradient(to_bottom,#101010_1px,transparent_1px)]" style={{ backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Animated elements */}
      <div className="relative w-full h-full">
        {/* Large central pulse */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[#00f697]"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ 
            opacity: [0.2, 0.3, 0.2], 
            scale: [0.8, 1.2, 0.8],
            x: "-50%",
            y: "-50%"
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          style={{ filter: "blur(60px)" }}
        />

        {/* Secondary pulses */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#00f697]"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              width: `${40 + Math.random() * 80}px`,
              height: `${40 + Math.random() * 80}px`,
              filter: "blur(30px)"
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 3 + Math.random() * 3, 
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Small decorative particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-[#00f697]"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              y: [0, -10 - Math.random() * 40],
              x: [0, (Math.random() - 0.5) * 20],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Digital circuit-like lines */}
        {[...Array(8)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const length = 60 + Math.random() * 100;
          const angle = Math.random() * 360;
         
          
          return (
            <motion.div
              key={`line-${i}`}
              className="absolute bg-[#00f697] opacity-20"
              style={{
                height: "1px",
                width: `${length}px`,
                top: `${startY}%`,
                left: `${startX}%`,
                transformOrigin: "left center",
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 4 + i
              }}
            />
          );
        })}
      </div>
    </div>
  );
};