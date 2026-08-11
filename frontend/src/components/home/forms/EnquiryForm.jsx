import React from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineSparkles, HiOutlineShieldCheck } from "react-icons/hi";
import api from "../../../lib/api";
import { useCountries } from "../../../hooks/useCountries";

const EnquiryForm = ({
  source = "other",
  variant = "light",
  title = "Get Free Counselling",
}) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { data: countries = [] } = useCountries();
  console.log(
    "reCAPTCHA SITE KEY:",

    import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  );

  console.log(
    "executeRecaptcha:",

    executeRecaptcha,
  );
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

      const recaptchaPromise = executeRecaptcha("enquiry");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("reCAPTCHA execution timed out")),
          5000,
        ),
      );

      const recaptchaToken = await Promise.race([
        recaptchaPromise,
        timeoutPromise,
      ]);

      if (!recaptchaToken || typeof recaptchaToken !== "string") {
        toast.error("Security verification failed. Please try again.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        interestedCountry: formData.interestedCountry || undefined,
        neetScore:
          formData.neetScore !== "" && formData.neetScore !== undefined
            ? Number(formData.neetScore)
            : undefined,
        message: formData.message?.trim() || undefined,
        source:
          typeof source === "string" && source.trim()
            ? source.trim().slice(0, 50)
            : "other",
        sourcePageUrl: window.location.pathname.slice(0, 500),
        recaptchaToken,
      };

      await api.post("/leads", payload);

      toast.success(
        "Thank you! Our senior counsellor will contact you shortly.",
      );

      reset();
    } catch (err) {
      toast.error(
        err.message === "reCAPTCHA execution timed out"
          ? "Verification timed out. Please disable ad-blockers or try again."
          : err.response?.data?.message ||
              "Something went wrong. Please try again.",
      );
    }
  };

  const inputClass = `w-full rounded-2xl border px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none transition-all duration-300 ${
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder-white/40 shadow-inner focus:border-coral focus:bg-white/10 focus:ring-2 focus:ring-coral/20"
      : "border-slate-200/90 bg-slate-50/50 text-navy-800 placeholder-slate-400/80 shadow-xs focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20 hover:border-slate-300"
  }`;

  const labelClass = `mb-1.5 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
    isDark ? "text-white/80" : "text-navy-700"
  }`;

  const errorClass =
    "mt-1.5 text-[10px] sm:text-[11px] font-semibold text-coral flex items-center gap-1";

  return (
    <div id="enquiry" className="relative w-full overflow-hidden">
      {/* Decorative Form Background Backlight Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 space-y-3.5 sm:space-y-4"
      >
        {/* Form Header */}
        <div
          className={`space-y-1.5 border-b pb-3.5 sm:pb-4 ${isDark ? "border-white/10" : "border-slate-100"}`}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-coral/20 bg-coral/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-coral backdrop-blur-md">
            <HiOutlineSparkles size={12} className="animate-pulse" /> Free
            Expert Advice
          </div>

          <h3
            className={`font-heading text-base sm:text-xl font-extrabold tracking-tight leading-snug ${
              isDark ? "text-white" : "text-navy-700"
            }`}
          >
            {title || "Have Doubts About Studying MBBS Abroad?"}
          </h3>

          <p
            className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-500"}`}
          >
            Fill in your details to speak directly with an expert counsellor
            today.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name*</label>
          <input
            type="text"
            autoComplete="name"
            maxLength={100}
            className={inputClass}
            placeholder="e.g. Rahul Sharma"
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length >= 2 ||
                "Name must be at least 2 characters",
            })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          <div>
            <label className={labelClass}>Phone*</label>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              className={inputClass}
              placeholder="10-digit mobile"
              {...register("phone", {
                required: "Phone is required",
                validate: (value) => {
                  const digits = value.replace(/\D/g, "");

                  if (digits.length < 8) {
                    return "Phone number is too short";
                  }

                  if (digits.length > 15) {
                    return "Phone number is too long";
                  }

                  return true;
                },
              })}
            />
            {errors.phone && (
              <p className={errorClass}>{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              className={inputClass}
              placeholder="you@example.com"
              {...register("email", {
                validate: (value) =>
                  !value ||
                  /^\S+@\S+\.\S+$/.test(value.trim()) ||
                  "Invalid email",
              })}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* City & NEET Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              autoComplete="address-level2"
              maxLength={100}
              className={inputClass}
              placeholder="Your city"
              {...register("city")}
            />
          </div>

          <div>
            <label className={labelClass}>NEET Score</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="1000"
              step="1"
              className={inputClass}
              placeholder="e.g. 450 (Optional)"
              {...register("neetScore", {
                validate: (value) => {
                  if (value === "") return true;

                  const score = Number(value);

                  return (
                    (Number.isInteger(score) && score >= 0 && score <= 1000) ||
                    "Enter a valid NEET score"
                  );
                },
              })}
            />
            {errors.neetScore && (
              <p className={errorClass}>{errors.neetScore.message}</p>
            )}
          </div>
        </div>

        {/* Interested Country */}
        <div>
          <label className={labelClass}>Interested Country</label>
          <div className="relative">
            <select
              className={`${inputClass} appearance-none cursor-pointer pr-10`}
              {...register("interestedCountry")}
            >
              <option value="" className={isDark ? "text-navy-900" : ""}>
                Select a study destination
              </option>

              {Array.isArray(countries) &&
                countries.map((country) => (
                  <option
                    key={country._id}
                    value={country._id}
                    className={isDark ? "text-navy-900" : ""}
                  >
                    MBBS in {country.name}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={labelClass}>Message or Question</label>
          <textarea
            rows={2.5}
            maxLength={2000}
            className={`${inputClass} resize-none`}
            placeholder="Ask us anything regarding university fees, hostel, or admission..."
            {...register("message")}
          />
        </div>

        {/* Action Button & Security Badge */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-2xl bg-coral py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-coral/25 transition-all duration-300 hover:bg-coral-600 hover:shadow-xl hover:shadow-coral/35 active:scale-[0.98] disabled:opacity-60 min-h-[48px]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Connecting with Expert...</span>
                </>
              ) : (
                <span>Get Free Counselling</span>
              )}
            </span>
            {/* Subtle Button Shimmer Glow Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400">
            <HiOutlineShieldCheck
              className="text-emerald-500 shrink-0"
              size={15}
            />
            <span>100% Confidential & Zero Spam Guarantee</span>
          </div>
        </div>

        <p
          className={`text-center text-[10px] ${
            isDark ? "text-white/50" : "text-slate-400"
          }`}
        >
          By submitting, you agree to our{" "}
          <a
            href="/privacy-policy"
            className="font-semibold underline hover:text-coral transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default EnquiryForm;
