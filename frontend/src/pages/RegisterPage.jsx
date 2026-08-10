import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  HiEye,
  HiEyeOff,
  HiArrowLeft,
  HiOutlineSparkles,
} from "react-icons/hi";
import { register as registerUser } from "../features/authSlice";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);

  // Password Visibility Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created! Welcome to your student portal.");
      navigate("/portal", { replace: true });
    } else {
      toast.error(result.payload || "Registration failed");
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

      {/* Outer Card Shell - Identical Dimensions to LoginPage */}
      <div className="relative z-10 flex w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white shadow-2xl backdrop-blur-xl">
        {/* Left Side: Form Area */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-7 lg:p-8 lg:w-1/2 bg-white overflow-y-auto">
          {/* Header Bar with Back Arrow & Image Logo (Identical to LoginPage) */}
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
          <div className="my-3 sm:my-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E15B3F]/20 bg-[#E15B3F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E15B3F]">
              <HiOutlineSparkles size={12} /> Student Registration
            </div>

            <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F3864]">
              Create your account!
            </h1>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Track applications, upload documents, and contact counsellors.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 space-y-2.5 sm:space-y-3"
            >
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                  Full Name*
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2 sm:py-2.5 text-xs text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                  {...register("name", {
                    required: "Name is required",
                    validate: (value) =>
                      value.trim().length >= 2 ||
                      "Name must be at least 2 characters",
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                  Email Address*
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2 sm:py-2.5 text-xs text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2 sm:py-2.5 text-xs text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit Indian phone number",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password & Confirm Password side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                    Password*
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 chars"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2 sm:py-2.5 pr-10 text-xs text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "At least 8 characters",
                        },
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
                        <HiEyeOff size={16} />
                      ) : (
                        <HiEye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1F3864]">
                    Confirm Password*
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3.5 py-2 sm:py-2.5 pr-10 text-xs text-[#1F3864] placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#E15B3F] focus:bg-white focus:ring-2 focus:ring-[#E15B3F]/20"
                      {...register("confirmPassword", {
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1F3864] transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff size={16} />
                      ) : (
                        <HiEye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-[11px] font-semibold text-[#E15B3F]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="group relative w-full overflow-hidden rounded-2xl bg-[#E15B3F] py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E15B3F]/25 transition-all duration-300 hover:bg-[#d04f35] hover:shadow-xl hover:shadow-[#E15B3F]/35 active:scale-[0.98] disabled:opacity-60 min-h-[44px]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </div>
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#1F3864] hover:text-[#E15B3F] hover:underline transition-colors"
            >
              Log in here
            </Link>
          </div>
        </div>

        {/* Right Side: Deep Navy Visual Branding Section */}
        <div
          className="relative hidden w-1/2 bg-cover bg-center p-10 lg:p-12 lg:flex lg:flex-col lg:justify-between overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-[#1F3864]/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A38] via-[#1F3864]/60 to-[#071A38]/70" />

          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#E15B3F]/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-[#E15B3F] w-max backdrop-blur-md">
              <HiOutlineSparkles size={14} /> Student Application Portal
            </span>

            <h2 className="mt-4 font-heading text-2xl lg:text-3xl font-extrabold leading-tight text-white">
              Start Your Journey To Studying MBBS Abroad
            </h2>

            <p className="mt-3 text-xs lg:text-sm text-slate-300 leading-relaxed">
              Get direct university admission guidance, upload documents
              securely, and receive 1-on-1 counseling support.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "NMC & WHO Recognized Universities",
                "100% Visa & Documentation Support",
                "Direct Admission & FMGE Preparation",
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

export default RegisterPage;
