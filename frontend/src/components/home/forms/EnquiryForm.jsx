import React from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
} from "react-icons/hi";
import api from "../../../lib/api";
import { useCountries } from "../../../hooks/useCountries";

const EnquiryForm = ({
  source = "other",
  variant = "light",
  title = "Get Free Counselling",
}) => {
  const { data: countries = [] } = useCountries();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const isDark = variant === "dark";

  const onSubmit = async (formData) => {
    try {
      if (!executeRecaptcha) {
        toast.error(
          "Security verification is still loading. Please try again.",
        );
        return;
      }

      const recaptchaToken = await executeRecaptcha("enquiry");

      if (!recaptchaToken) {
        toast.error("Security verification failed. Please try again.");
        return;
      }

      await api.post("/leads", {
        ...formData,
        source,
        sourcePageUrl: window.location.pathname,
        recaptchaToken,
      });

      toast.success(
        "Thank you! Our senior counsellor will contact you shortly.",
      );

      reset();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };
  const inputClass = `w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all duration-200 ${
    isDark
      ? "border-white/15 bg-white/10 text-white placeholder-white/50 focus:border-coral focus:ring-1 focus:ring-coral"
      : "border-slate-200 bg-white text-navy-800 placeholder-slate-400 focus:border-coral focus:ring-1 focus:ring-coral"
  }`;
  const labelClass = `mb-1 block text-[11px] font-bold uppercase tracking-wider ${
    isDark ? "text-white/80" : "text-navy-600"
  }`;
  const errorClass = "mt-1 text-[11px] font-semibold text-coral";

  return (
    <div id="enquiry" className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Form Header */}
        <div className="space-y-1.5 border-b border-slate-100/20 pb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">
            <HiOutlineSparkles size={12} /> Free Expert Advice
          </div>
          <h3
            className={`font-heading text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-navy-700"}`}
          >
            Have Doubts About Studying MBBS Abroad?
          </h3>
          <p
            className={`text-xs ${isDark ? "text-white/70" : "text-slate-500"}`}
          >
            Fill in your details to speak directly with an expert counsellor
            today.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name*</label>
          <input
            className={inputClass}
            placeholder="e.g. Rahul Sharma"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone*</label>
            <input
              className={inputClass}
              placeholder="10-digit mobile"
              {...register("phone", {
                required: "Phone is required",
                minLength: { value: 8, message: "Too short" },
              })}
            />
            {errors.phone && (
              <p className={errorClass}>{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              placeholder="you@example.com"
              {...register("email", {
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* City & NEET Score */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              placeholder="Your city"
              {...register("city")}
            />
          </div>
          <div>
            <label className={labelClass}>NEET Score</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 450 (Optional)"
              {...register("neetScore")}
            />
          </div>
        </div>

        {/* Interested Country */}
        <div>
          <label className={labelClass}>Interested Country</label>
          <select className={inputClass} {...register("interestedCountry")}>
            <option value="" className={isDark ? "text-navy-900" : ""}>
              Select a study destination
            </option>
            {countries.map((c) => (
              <option
                key={c._id}
                value={c._id}
                className={isDark ? "text-navy-900" : ""}
              >
                MBBS in {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className={labelClass}>Message or Question</label>
          <textarea
            rows={2.5}
            className={inputClass}
            placeholder="Ask us anything regarding university fees, hostel, or admission..."
            {...register("message")}
          />
        </div>

        {/* Action Button & Security Badge */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-coral py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-95 disabled:opacity-60"
          >
            {isSubmitting
              ? "Connecting with Expert..."
              : "Get Free Counselling"}
          </button>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <HiOutlineShieldCheck className="text-emerald-500" size={14} />
            <span>100% Confidential & Zero Spam Guarantee</span>
          </div>
        </div>

        <p
          className={`text-center text-[10px] ${isDark ? "text-white/50" : "text-slate-400"}`}
        >
          By submitting, you agree to our{" "}
          <a href="/privacy-policy" className="underline hover:text-coral">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default EnquiryForm;
