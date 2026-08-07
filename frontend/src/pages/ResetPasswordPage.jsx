import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/layout/AuthShell';
import api from '../lib/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: formData.password });
      toast.success('Password reset successful. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    }
  };

  return (
    <AuthShell
      title="Set a New Password"
      footer={
        <Link to="/login" className="font-semibold text-coral hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-500">New Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-navy-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
          />
          {errors.password && <p className="mt-1 text-xs text-coral-500">{errors.password.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-500">Confirm Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-navy-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral"
            {...register('confirmPassword', { validate: (v) => v === watch('password') || 'Passwords do not match' })}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-coral-500">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
