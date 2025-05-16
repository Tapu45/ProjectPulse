import  { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  Settings,
  ArrowRight,
} from "lucide-react";
import { ProjectPulseAnimation } from "../components/animations/Homeanimation";
import { useNavigate } from "react-router-dom";

// Main Landing Page Component
export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ProjectPulseAnimation />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <nav className="flex justify-between items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Activity className="h-8 w-8 mr-2 text-[#00f697]" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f697] to-[#00ffcc]">
                ProjectPulse
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden md:flex space-x-8"
            ></motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={() => navigate("/login")}
              className="bg-[#00f697] hover:bg-[#00e085] text-black px-6 py-2 rounded-md font-medium flex items-center cursor-pointer"
            >
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </nav>

          <div className="flex flex-col md:flex-row items-center py-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="md:w-1/2 mb-10 md:mb-0"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Track & Resolve Issues
                <span className="block text-[#00f697]">Seamlessly</span>
              </h1>
              <p className="text-lg mb-8 text-gray-300 max-w-lg">
                Your all-in-one solution for after-service project management,
                issue tracking, and client support.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-[#00f697] hover:bg-[#00e085] text-black px-8 py-3 rounded-md font-medium cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="md:w-1/2"
            >
              <div className="relative">
                <div className="bg-gradient-to-tr from-[#00f697] to-transparent opacity-20 absolute w-full h-full rounded-xl blur-xl"></div>
                <div className="relative bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-black p-4 rounded-lg">
                    <div className="flex justify-between mb-4 items-center">
                      <h3 className="font-medium">Active Issues</h3>
                      <span className="bg-[#00f69730] text-[#00f697] px-2 py-1 rounded text-sm">
                        12 Open
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + item * 0.2, duration: 0.5 }}
                          className="bg-gray-900 p-3 rounded-lg border border-gray-800"
                        >
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">
                              #PP-10{item}
                            </span>
                            <span className="text-xs bg-yellow-500 bg-opacity-20 text-yellow-300 px-2 py-0.5 rounded">
                              In Progress
                            </span>
                          </div>
                          <p className="text-sm mt-2">
                            Database connection timeout issue
                          </p>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> 2h ago
                            </span>
                            <span>Client: TechCorp</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <div className="h-1 w-20 bg-[#00f697] mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <AlertCircle className="h-8 w-8" />,
                title: "Issue Tracking",
                description:
                  "Efficiently log, categorize, and monitor client issues through their entire lifecycle.",
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Resolution Management",
                description:
                  "Streamline the process of resolving client issues with priority-based workflows.",
              },
              {
                icon: <Bell className="h-8 w-8" />,
                title: "Real-time Notifications",
                description:
                  "Keep clients informed with automated updates on issue status and resolution progress.",
              },
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Performance Analytics",
                description:
                  "Track your team's performance and identify trends to improve service delivery.",
              },
              {
                icon: <Settings className="h-8 w-8" />,
                title: "Customizable Workflows",
                description:
                  "Adapt your issue tracking process to match your unique project requirements.",
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "SLA Monitoring",
                description:
                  "Set and track service level agreements to ensure timely issue resolution.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 * i, duration: 0.6 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-[#00f697] transition-all duration-300"
              >
                <div className="text-[#00f697] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00f697] rounded-full filter blur-3xl opacity-10"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-gray-900 to-black p-8 md:p-12 rounded-2xl border border-gray-800"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to transform your after-service experience?
                </h2>
                <p className="text-gray-400 max-w-lg">
                  Join the growing community of satisfied clients who have
                  streamlined their project support workflow with ProjectPulse.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00f697] hover:bg-[#00e085] text-black px-8 py-4 rounded-md font-medium"
              >
                Get Started Today
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row justify-between">
      <div className="mb-8 md:mb-0">
        <div className="flex items-center mb-4">
          <Activity className="h-6 w-6 mr-2 text-[#00f697]" />
          <span className="text-xl font-bold">ProjectPulse</span>
        </div>
        <p className="text-gray-400 max-w-xs">
          Streamlining post-project support and issue resolution for
          development teams worldwide.
        </p>
        <motion.a
          href="https://linktr.ee/Rameswar45"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-[#00f697] rounded-md transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-medium">About the Developer</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </motion.a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Product</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Changelog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Documentation
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Company</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a 
                href="https://linktr.ee/Rameswar45" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00f697] flex items-center group"
              >
                About
                <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Legal</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#00f697]">
                Security
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <div className="text-gray-500 text-sm mb-4 md:mb-0 flex items-center">
        <span>© 2025 ProjectPulse. All rights reserved.</span>
        <a 
          href="https://linktr.ee/Rameswar45" 
          className="ml-4 text-[#00f697] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by Rameswar
        </a>
      </div>
      <div className="flex space-x-6">
        <a href="#" className="text-gray-400 hover:text-[#00f697] transition-colors duration-300">
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-[#00f697] transition-colors duration-300">
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-[#00f697] transition-colors duration-300">
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-[#00f697] transition-colors duration-300">
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
          </svg>
        </a>
        <a 
          href="https://linktr.ee/Rameswar45" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#00f697] transition-colors duration-300"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.953 15.066c-.08 0-.16-.02-.232-.06-.21-.09-.347-.302-.347-.53V9.538c0-.23.136-.44.347-.532.212-.09.46-.05.622.11l4.022 3.46c.122.12.192.282.192.453s-.07.332-.193.453l-4.02 3.46c-.1.1-.24.156-.38.156" />
            <path d="M12.46 15.066c-.08 0-.16-.02-.232-.06-.21-.09-.347-.302-.347-.53V9.538c0-.23.136-.44.347-.532.21-.09.46-.05.62.11l4.023 3.46c.12.12.19.282.19.453s-.07.332-.192.453l-4.02 3.46c-.1.1-.24.156-.38.156" />
            <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12S6.07 1.25 12 1.25 22.75 6.07 22.75 12 17.93 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}
