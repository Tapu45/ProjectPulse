import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api  from '../../config/api';
import { API_ROUTES } from '../../config/api';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>();
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
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
                <h3 className="text-sm font-medium text-green-400">Email sent</h3>
                <p className="mt-2 text-sm text-gray-400">
                  If an account exists with this email, you will receive password reset instructions.
                </p>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-700'
                    } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-[#00f697] focus:border-[#00f697] sm:text-sm`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
                    'Send Reset Link'
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

export default ForgotPassword;