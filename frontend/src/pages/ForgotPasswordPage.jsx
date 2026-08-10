import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft, HiOutlineSparkles } from "react-icons/hi";
import api from "../lib/api";

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      await api.post("/auth/forgot-password", formData);
      toast.success("Instructions sent if account exists!");
    } catch (err) {
      // Catch optional error if needed
    } finally {
      setSent(true); // always show generic success state matching anti-enumeration guidelines
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#071A38] p-3 sm:p-6 lg:p-8 text-slate-800 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E15B3F]/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px]"
        aria-hidden="true"
      />

      {/* Outer Card Shell */}
      <div className="relative z-10 flex w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white shadow-2xl backdrop-blur-xl">
        {/* Left Side: Clean Form Area */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-7 lg:p-8 lg:w-1/2 bg-white">
          {/* Header Bar with Back Arrow & Logo */}
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-[#1F3864] transition-all duration-200 hover:border-[#E15B3F]/40 hover:bg-[#E15B3F]/5 hover:text-[#E15B3F]"
              aria-label="Back to login"
            >
              <HiArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Login</span>
            </Link>

            <Link
              to="/"
              className="inline-block transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/medicologo-removebg-preview.png"
                alt="Medico Overseas Logo"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Main Title & Form / Success State */}
          <div className="my-4 sm:my-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E15B3F]/20 bg-[#E15B3F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E15B3F]">
              <HiOutlineSparkles size={12} /> Account Recovery
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F3864]">
              Reset your password
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter the email address associated with your account and we’ll
              send you a password reset link.
            </p>

            {sent ? (
              <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 sm:p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E15B3F]/10 text-[#E15B3F] mb-3">
                  <HiOutlineSparkles size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#1F3864]">
                  Reset Link Sent
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  If an account with that email exists, a reset link has been
                  sent to your inbox. Please check your email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-5 sm:mt-6 space-y-3 sm:space-y-4"
              >
                {/* Email Input */}
                <div>
                  <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                      {...register("email", { required: "Email is required" })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-2xl bg-[#E15B3F] py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E15B3F]/25 transition-all duration-300 hover:bg-[#d04f35] hover:shadow-xl hover:shadow-[#E15B3F]/35 active:scale-[0.98] disabled:opacity-60 min-h-[48px]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </span>
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-bold text-[#1F3864] hover:text-[#E15B3F] hover:underline transition-colors"
            >
              Log in here
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Branding Section */}
        <div
          className="relative hidden w-1/2 bg-cover bg-center p-10 lg:p-12 lg:flex lg:flex-col lg:justify-between overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80')",
          }}
        >
          {/* Dark Navy Overlay Gradients */}
          <div className="absolute inset-0 bg-[#1F3864]/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A38] via-[#1F3864]/60 to-[#071A38]/70" />

          {/* Ambient Glow */}
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#E15B3F]/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-[#E15B3F] w-max backdrop-blur-md">
              <HiOutlineSparkles size={14} /> Password Recovery Assistance
            </span>

            <h2 className="mt-4 font-heading text-2xl lg:text-3xl font-extrabold leading-tight text-white">
              Secure Access to Your Student Portal
            </h2>

            <p className="mt-3 text-xs lg:text-sm text-slate-300 leading-relaxed">
              Don't worry, we'll help you regain access to your application
              updates, counselor chats, and university records safely.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              {[
                "Encrypted Password Reset Requests",
                "Instant Email Verification",
                "Dedicated Portal Security",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-[#E15B3F]/40"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E15B3F] text-xs font-bold text-white shadow-xs">
                    ✓
                  </div>
                  <span className="text-xs font-semibold text-slate-100">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
