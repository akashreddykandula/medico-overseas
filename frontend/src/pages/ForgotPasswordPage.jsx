import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import api from '../lib/api';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    try {
      await api.post('/auth/forgot-password', formData);
    } finally {
      setSent(true); // always show the generic success state, matching backend's anti-enumeration behavior
    }
  };

  return (
    <AuthShell
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link to="/login" className="font-semibold text-coral hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-xl bg-navy-50 p-4 text-center text-sm text-navy-600">
          If an account with that email exists, a reset link has been sent. Please check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-navy-500">Email</label>
            <input type="email" className="w-full rounded-xl border border-navy-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-xs text-coral-500">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;
