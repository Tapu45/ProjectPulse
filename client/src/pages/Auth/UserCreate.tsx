import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Building, 
  Shield, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import api, { API_ROUTES } from '../../config/api';

// Form schema matching the backend validation
const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  organization: z.string().optional(),
  role: z.enum(['CLIENT', 'ADMIN', 'SUPPORT'], { 
    errorMap: () => ({ message: "Role must be CLIENT, ADMIN, or SUPPORT" })
  })
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface UserCreateProps {
  onSuccess?: () => void;
}

const UserCreate: React.FC<UserCreateProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'CLIENT',
      organization: '',
    }
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await api.post(API_ROUTES.ADMIN.CREATE_USER, data);
      setSuccessMessage(`User ${response.data.data.name} created successfully!`);
      if (onSuccess) {
      onSuccess();
    }
      reset(); // Reset form fields
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred while creating the user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const roleColors: Record<string, string> = {
    'CLIENT': '#00f697', // mint accent
    'ADMIN': '#ff7b92',  // pink
    'SUPPORT': '#61dbfb'  // light blue
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        backgroundColor: 'bg-gray-800',
        border: '1px solid #333'
      }}
    >
      <motion.div 
        variants={itemVariants}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '0.75rem'
        }}
      >
        <UserPlus size={28} style={{ color: '#00f697' }} />
        <h1 style={{ 
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#ffffff',
          textShadow: '0 0 10px rgba(0, 246, 151, 0.3)'
        }}>
          Create New User
        </h1>
      </motion.div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(0, 246, 151, 0.1)',
            borderLeft: '4px solid #00f697',
            color: '#00f697',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Check size={18} />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(255, 123, 146, 0.1)',
            borderLeft: '4px solid #ff7b92',
            color: '#ff7b92',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div 
          variants={itemVariants}
          style={{ marginBottom: '1.25rem' }}
        >
          <label
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#e0e0e0'
            }}
          >
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <UserIcon 
              size={18}
              style={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '0.75rem',
                color: '#00f697'
              }}  
            />
            <input
              id="name"
              {...register('name')}
              placeholder="Enter full name"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: errors.name ? '#ff7b92' : '#333',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                // Focus styles should be handled via CSS classes
              }}
            />
          </div>
          {errors.name && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#ff7b92', 
              marginTop: '0.25rem' 
            }}>
              {errors.name.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          style={{ marginBottom: '1.25rem' }}
        >
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#e0e0e0'
            }}
          >
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail 
              size={18}
              style={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '0.75rem',
                color: '#00f697'
              }}  
            />
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: errors.email ? '#ff7b92' : '#333',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          </div>
          {errors.email && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#ff7b92', 
              marginTop: '0.25rem' 
            }}>
              {errors.email.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          style={{ marginBottom: '1.25rem' }}
        >
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#e0e0e0'
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock 
              size={18}
              style={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '0.75rem',
                color: '#00f697'
              }}  
            />
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: errors.password ? '#ff7b92' : '#333',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          </div>
          {errors.password && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#ff7b92', 
              marginTop: '0.25rem' 
            }}>
              {errors.password.message}
            </p>
          )}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          style={{ marginBottom: '1.25rem' }}
        >
          <label
            htmlFor="organization"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#e0e0e0'
            }}
          >
            Organization (Optional)
          </label>
          <div style={{ position: 'relative' }}>
            <Building 
              size={18}
              style={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '0.75rem',
                color: '#00f697'
              }}  
            />
            <input
              id="organization"
              {...register('organization')}
              placeholder="Enter organization name"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #333',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          style={{ marginBottom: '2rem' }}
        >
          <label
            htmlFor="role"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#e0e0e0'
            }}
          >
            User Role
          </label>
          <div style={{ position: 'relative' }}>
            <Shield 
              size={18}
              style={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: '0.75rem',
                color: '#00f697'
              }}  
            />
            <select
              id="role"
              {...register('role')}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: errors.role ? '#ff7b92' : '#333',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%2300f697%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")',
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Administrator</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
          {errors.role && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#ff7b92', 
              marginTop: '0.25rem' 
            }}>
              {errors.role.message}
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0, 246, 151, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#00f697',
              color: '#121212',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: '0 0 10px rgba(0, 246, 151, 0.3)'
            }}
          >
            {isSubmitting ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <UserPlus size={18} />
            )}
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </motion.button>
        </motion.div>
      </form>

      {/* Role badges preview */}
      <motion.div 
        variants={itemVariants}
        style={{ 
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backgroundColor: '#222',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #333'
        }}
      >
        <h3 style={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#e0e0e0',
          marginBottom: '0.5rem'
        }}>
          Available User Roles:
        </h3>
        
        <motion.div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['CLIENT', 'ADMIN', 'SUPPORT'].map(role => (
            <motion.div
              key={role}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 8px ${roleColors[role]}60` }}
              style={{
                display: 'flex', 
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                backgroundColor: `${roleColors[role]}15`,
                color: roleColors[role],
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1px solid ${roleColors[role]}30`,
                boxShadow: `0 0 5px ${roleColors[role]}30`
              }}
            >
              <Shield size={14} />
              {role}
            </motion.div>
          ))}
        </motion.div>

        <motion.p 
          variants={itemVariants}
          style={{ 
            fontSize: '0.75rem', 
            color: '#999',
            marginTop: '0.5rem'
          }}
        >
          Note: Users will receive a welcome email based on their assigned role.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default UserCreate;