import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { API_ROUTES } from '../../config/api';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { LoginIllustrations } from '../../components/animations/Loginillustration';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    organization?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>();
  
  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await axios.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      switch(data.user.role) {
        case 'ADMIN':
          navigate('/dashboard');
          break;
        case 'SUPPORT':
          navigate('/assigned-complaints');
          break;
        case 'CLIENT':
          navigate('/complaints');
          break;
        case 'STAFF':
          navigate('/staff/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    }
  });
  
  const onSubmit = (data: LoginFormData) => {
    setError(null);
    mutation.mutate(data);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Login form column */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex justify-center items-center p-4 lg:p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <Activity className="h-8 w-8 mr-2 text-[#00f697]" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f697] to-[#00ffcc]">
                ProjectPulse
              </span>
            </div>
            <h2 className="text-xl text-white mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm">Sign in to continue to your account</p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 text-red-300 p-3 rounded mb-4 text-sm border border-red-900/50"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-800 border border-gray-700 text-white sm:text-sm rounded-lg focus:ring-[#00f697] focus:border-[#00f697] block w-full p-2.5"
                placeholder="name@company.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="text-sm font-medium block mb-2 text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="bg-gray-800 border border-gray-700 text-white sm:text-sm rounded-lg focus:ring-[#00f697] focus:border-[#00f697] block w-full p-2.5"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-700 rounded bg-gray-800 focus:ring-[#00f697]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-300">Remember me</label>
                </div>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#00f697] hover:underline">
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-gray-900 bg-[#00f697] hover:bg-[#00e085] focus:ring-4 focus:ring-[#00f697]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-t-2 border-gray-900 rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Need help? <a href="mailto:support@projectpulse.com" className="text-[#00f697] hover:underline">Contact Support</a></p>
          </div>
        </div>
      </motion.div>
      
      {/* Illustrations column - hidden on small screens */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <LoginIllustrations />
      </div>
    </div>
  );
};

export default Login;