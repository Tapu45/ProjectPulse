import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, MessageSquare, BarChart4, Laptop } from 'lucide-react';

export const LoginIllustrations: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00f697] rounded-full filter blur-[100px] opacity-15 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMyMDIwMjAiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgNjBIMFYwaDYwdjYwek01OSAxSDFtMCA1OGg1OCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f697] to-[#00ffcc]">ProjectPulse</span>
          </h2>
          <p className="text-gray-400">Your all-in-one project management solution</p>
        </motion.div>

        {/* Illustration 1: Issue Tracking Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mb-12"
        >
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-3 border-b border-gray-800 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400 ml-3 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-[#00f697]" />
                <span>Issue Tracking Dashboard</span>
              </div>
            </div>
            <div className="p-4 bg-black/60">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 60 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="bg-gradient-to-t from-[#00f697] to-[#00f69730] rounded-t-md relative"
                >
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-black font-medium">Resolved</span>
                </motion.div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 80 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="bg-gradient-to-t from-yellow-500 to-yellow-500/30 rounded-t-md relative"
                >
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-black font-medium">Pending</span>
                </motion.div>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 40 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="bg-gradient-to-t from-blue-500 to-blue-500/30 rounded-t-md relative"
                >
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-black font-medium">New</span>
                </motion.div>
              </div>
              <div className="h-4 w-full bg-gray-800 rounded mb-3"></div>
              <div className="h-4 w-4/5 bg-gray-800 rounded"></div>
            </div>
          </div>
        </motion.div>

        {/* Illustration 2: Project Status Updates */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-md mb-12"
        >
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-[#00f69730] flex items-center justify-center mr-3">
                <Laptop className="h-4 w-4 text-[#00f697]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Project Insights</h3>
                <p className="text-xs text-gray-400">Real-time updates</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: "Backend API optimizations completed", time: "10m ago", status: "success" },
                { icon: MessageSquare, text: "Client feedback requested on new design", time: "2h ago", status: "warning" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + (i * 0.2), duration: 0.5 }}
                  className="bg-black/40 p-3 rounded border border-gray-800 flex items-start"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    item.status === 'success' ? 'bg-[#00f69720] text-[#00f697]' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white">{item.text}</p>
                    <span className="text-[10px] text-gray-500">{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Illustration 3: Analytics Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <BarChart4 className="h-4 w-4 text-[#00f697] mr-2" />
                <h3 className="text-sm font-medium text-white">Performance Metrics</h3>
              </div>
              <span className="text-xs bg-[#00f69730] text-[#00f697] px-2 py-1 rounded">Weekly</span>
            </div>
            
            <div className="flex items-end h-[80px] gap-2 mb-2">
              {[40, 65, 35, 85, 55, 45, 75].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 2 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                  className={`flex-1 rounded-t ${i === 4 ? 'bg-[#00f697]' : 'bg-gray-700'}`}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};