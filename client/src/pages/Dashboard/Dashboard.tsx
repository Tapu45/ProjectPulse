import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CategoryChart } from "../../components/ui/dashboard/CategoryChart";
import { ComplaintsTrend } from "../../components/ui/dashboard/ComplaintsTrends";
import { PriorityChart } from "../../components/ui/dashboard/PriorityChart";
import { ResolutionTime } from "../../components/ui/dashboard/ResolutionTime";
import { StatsOverviewCard } from "../../components/ui/dashboard/StatsOverViewCard";
import { StatusChart } from "../../components/ui/dashboard/StatusChart";
import { TopProjects } from "../../components/ui/dashboard/TopProject";
import { WorkloadDistribution } from "../../components/ui/dashboard/WorkloadDistribution";

// Pulse animation component
const PulseEffect = () => {
  const rings = Array(5).fill(0);
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0 opacity-30">
      {rings.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-[#00f697]" // Increased border width
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: 20,
            height: 20,
          }}
          animate={{
            width: [20, 300 + Math.random() * 200],
            height: [20, 300 + Math.random() * 200],
            opacity: [0.9, 0], // Increased starting opacity
            x: [0, -150],
            y: [0, -150],
          }}
          transition={{
            duration: 6 + i * 2,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: i * 2,
          }}
        />
      ))}
    </div>
  );
};

// Floating orbs animation
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 opacity-40"> {/* Increased opacity */}
      {Array(8).fill(0).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-[#00f697] to-teal-500 shadow-lg shadow-[#00f697]/20" // Added shadow glow
          style={{
            width: 30 + Math.random() * 50,
            height: 30 + Math.random() * 50,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: "blur(2px)" // Added subtle blur for glow effect
          }}
          animate={{
            y: [Math.random() * 50, Math.random() * -50],
            x: [Math.random() * 50, Math.random() * -50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative p-6 bg-gray-950 min-h-screen overflow-hidden">
      {/* Background animations */}
      {mounted && (
        <>
          <PulseEffect />
          <FloatingOrbs />
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-gray-950/90 to-gray-950/80 z-0"></div>
        </>
      )}

      {/* Dashboard content with increased z-index */}
      <div className="relative z-10">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[#00f697]">Project</span>Pulse Dashboard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StatsOverviewCard />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CategoryChart />
          <StatusChart />
          <PriorityChart />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <ComplaintsTrend />
          <TopProjects />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <ResolutionTime />
          <WorkloadDistribution />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;