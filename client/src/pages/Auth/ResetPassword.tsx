import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api  from '../../config/api';
import { API_ROUTES } from '../../config/api';
import { AlertCircle, Check, Loader2, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormValues>();
  const password = watch('password');
  
  // Extract token from URL when component loads
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setIsTokenInvalid(true);
      setError('Invalid password reset link. Please request a new one.');
    } else {
      setToken(resetToken);
    }
  }, [location]);
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await api.post(API_ROUTES.AUTH.RESET_PASSWORD, {
        token,
        password: data.password
      });
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isTokenInvalid) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-white">Invalid Reset Link</h2>
              <p className="mt-2 text-gray-400">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#00f697] hover:bg-[#00e080] focus:outline-none"
              >
                Request New Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your new password below
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/50 p-4 rounded-md border border-green-700/50 flex"
            >
              <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-400">Password reset successful</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Your password has been reset successfully. Redirecting you to login...
                </p>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-700'
                    } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-[#00f697] focus:border-[#00f697] sm:text-sm`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long'
                      }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                    } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-[#00f697] focus:border-[#00f697] sm:text-sm`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              {error && (
                <div className="bg-red-900/30 border border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </p>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#00f697] hover:bg-[#00e080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f697] focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <a href="/login" className="text-sm text-[#00f697] hover:underline">
                  Back to login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;