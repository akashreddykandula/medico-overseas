import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { HiEye, HiEyeOff } from "react-icons/hi";
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
      const redirectTo =
        location.state?.from ||
        (result.payload.user.role === "student" ? "/portal" : "/admin");
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF2F6] p-4 sm:p-8">
      {/* Outer Card Shell */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Left Side: Clean Form Area */}
        <div className="flex w-full flex-col justify-between p-8 sm:p-12 lg:w-1/2">
          {/* Logo Header */}
          <div>
            <Link to="/" className="inline-block">
              <img
                src="/medicologo-removebg-preview.png"
                alt="Medico Overseas Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Main Title & Form */}
          <div className="my-8">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F2540] sm:text-3xl">
              Sign in to your account!
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Log in to track your application or manage the platform
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border-b border-slate-300 py-2.5 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input with Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border-b border-slate-300 py-2.5 pr-10 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-[#0F2540] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#D94A28] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-[#D94A28] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:opacity-60"
              >
                {status === "loading" ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#0F2540] hover:underline"
            >
              Create one here
            </Link>
          </div>
        </div>

        {/* Right Side: Deep Navy Visual Branding Section with Medical Travel Imagery */}
        <div
          className="relative hidden w-1/2 bg-cover bg-center p-12 lg:flex lg:flex-col lg:justify-between"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80')",
          }}
        >
          {/* Dark Navy Overlay Gradients */}
          <div className="absolute inset-0 bg-[#0F2540]/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2540] via-transparent to-[#0F2540]/60" />

          {/* Ambient Glow */}
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#D94A28]/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <span className="inline-block rounded-full border border-[#D94A28]/40 bg-[#D94A28]/20 px-3 py-1 text-xs font-semibold text-[#D94A28] w-max backdrop-blur-md">
              Medico Overseas Portal
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
              Welcome Back to Your Global Medical Journey
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Access your real-time application status, upload necessary
              university documents, and consult directly with expert counselors.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              {[
                "Real-Time Application Status Tracking",
                "Direct Counselor Messaging & Guidance",
                "NMC & WHO Recognized University Updates",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md shadow-sm"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D94A28] text-xs text-white">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-100">
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

export default LoginPage;
