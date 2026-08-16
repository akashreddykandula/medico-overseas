import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HiEye,
  HiEyeOff,
  HiArrowLeft,
  HiOutlineSparkles,
} from "react-icons/hi";
import { motion } from "framer-motion";
import { login } from "../features/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((s) => s.auth);

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      const role = result.payload.user.role;

      const defaultRedirect = role === "student" ? "/portal" : "/admin";
      const requestedRedirect = location.state?.from;

      const redirectTo =
        typeof requestedRedirect === "string" &&
        requestedRedirect.startsWith("/") &&
        !requestedRedirect.startsWith("//")
          ? requestedRedirect
          : defaultRedirect;

      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#071A38] p-3 sm:p-6 lg:p-8 text-slate-800 overflow-hidden">
      {/* ================= CONTINUOUS BACKGROUND ANIMATIONS ================= */}
      {/* 1. Primary Glowing Aura Orb - Floating & Pulsing */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -35, 15, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.6, 0.85, 0.6],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-[#E15B3F]/15 blur-[130px]"
        aria-hidden="true"
      />

      {/* 2. Top Right Cyan Glow - Slow Counter Float */}
      <motion.div
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-10 -top-10 h-80 w-80 rounded-full bg-sky-500/15 blur-[110px]"
        aria-hidden="true"
      />

      {/* 3. Deep Navy Ambient Wave Glow Bottom-Left */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-[#1F3864] blur-[100px] opacity-70"
        aria-hidden="true"
      />

      {/* Outer Card Shell Entrance & Subtle Continuous Breathe */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white shadow-2xl backdrop-blur-xl"
      >
        {/* Left Side: Clean Form Area */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-7 lg:p-8 lg:w-1/2 bg-white">
          {/* Header Bar with Back Arrow & Logo */}
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-[#1F3864] transition-all duration-200 hover:border-[#E15B3F]/40 hover:bg-[#E15B3F]/5 hover:text-[#E15B3F]"
              aria-label="Back to home"
            >
              <HiArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Home</span>
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

          {/* Main Title & Form */}
          <div className="my-4 sm:my-5">
            {/* Pulsing Badge */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E15B3F]/20 bg-[#E15B3F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E15B3F]"
            >
              <HiOutlineSparkles size={12} /> Student & Portal Access
            </motion.div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F3864]">
              Sign in to your account!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Log in Apply & to track your application or manage the platform.
            </p>

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

              {/* Password Input with Eye Icon */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-[#E15B3F] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1F3864] transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <HiEyeOff size={18} />
                    ) : (
                      <HiEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button with Continuous Dynamic Glow */}
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{ scale: status === "loading" ? 1 : 1.01 }}
                whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                className="group relative w-full overflow-hidden rounded-2xl bg-[#E15B3F] py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E15B3F]/25 transition-all duration-300 hover:bg-[#d04f35] hover:shadow-xl hover:shadow-[#E15B3F]/35 active:scale-[0.98] disabled:opacity-60 min-h-[48px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {status === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </span>

                {/* Continuous Premium Button Shimmer Loop */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1.5,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                />
              </motion.button>
            </form>
            <p className="mt-3 text-center text-[9px] leading-relaxed text-slate-400">
              This site is protected by reCAPTCHA and the Google{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#1F3864] hover:text-[#E15B3F] hover:underline transition-colors"
            >
              Create one here
            </Link>
          </div>
        </div>

        {/* Right Side: Deep Navy Visual Branding Section with Medical Travel Imagery */}
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

          {/* Ambient Floating Glow Right Top */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#E15B3F]/25 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-[#E15B3F] w-max backdrop-blur-md"
            >
              <HiOutlineSparkles size={14} /> Medico Overseas Portal
            </motion.span>

            <h2 className="mt-4 font-heading text-2xl lg:text-3xl font-extrabold leading-tight text-white">
              Welcome Back to Your Global Medical Journey
            </h2>

            <p className="mt-3 text-xs lg:text-sm text-slate-300 leading-relaxed">
              Access your real-time application status, upload necessary
              university documents, and consult directly with expert counselors.
            </p>

            {/* Feature Pills with Continuous Anti-Gravity Floating Motion */}
            <div className="mt-8 space-y-3">
              {[
                "Real-Time Application Status Tracking",
                "Direct Counselor Messaging & Guidance",
                "NMC & WHO Recognized University Updates",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: i % 2 === 0 ? [0, -6, 0] : [0, 6, 0],
                  }}
                  transition={{
                    duration: 4 + i * 0.8,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-[#E15B3F]/40 hover:bg-white/15"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E15B3F] text-xs font-bold text-white shadow-xs"
                  >
                    ✓
                  </motion.div>
                  <span className="text-xs font-semibold text-slate-100">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
