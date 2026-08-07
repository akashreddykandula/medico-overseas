import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { register as registerUser } from "../features/authSlice";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);
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
              Create your account!
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track your application, upload documents, and message your
              counsellor
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border-b border-slate-300 py-2.5 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full border-b border-slate-300 py-2.5 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border-b border-slate-300 py-2.5 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "At least 8 characters" },
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full border-b border-slate-300 py-2.5 text-sm text-[#0F2540] placeholder-slate-400 outline-none transition-colors focus:border-[#D94A28]"
                  {...register("confirmPassword", {
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-[#D94A28]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-[#D94A28] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:opacity-60"
              >
                {status === "loading"
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#0F2540] hover:underline"
            >
              Log in here
            </Link>
          </div>
        </div>

        {/* Right Side: Deep Navy Visual Branding Section */}
        <div className="relative hidden w-1/2 bg-[#0F2540] p-12 lg:flex lg:flex-col lg:justify-between">
          {/* Subtle Ambient Red/Coral Glow Orb */}
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#D94A28]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <span className="inline-block rounded-full bg-[#D94A28]/20 px-3 py-1 text-xs font-semibold text-[#D94A28] w-max">
              Student Application Portal
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
              Start Your Journey To Studying MBBS Abroad
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Get direct university admission guidance, upload documents
              securely, and get 1-on-1 counseling support.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              {[
                "NMC & WHO Recognized Universities",
                "100% Visa & Documentation Support",
                "Direct Admission & FMGE Preparation",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-md"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D94A28] text-xs text-white">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-slate-200">
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
