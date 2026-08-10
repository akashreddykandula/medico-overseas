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

  const inputClass = `w-full rounded-xl border px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition-all duration-200 ${
    isDark
      ? "border-white/15 bg-white/10 text-white placeholder-white/50 focus:border-coral focus:ring-1 focus:ring-coral"
      : "border-slate-200 bg-white text-navy-800 placeholder-slate-400 focus:border-coral focus:ring-1 focus:ring-coral"
  }`;

  const labelClass = `mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
    isDark ? "text-white/80" : "text-navy-600"
  }`;

  const errorClass = "mt-1 text-[10px] sm:text-[11px] font-semibold text-coral";

  return (
    <div id="enquiry" className="relative w-full overflow-hidden">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 sm:space-y-3.5"
      >
        <div className="space-y-1 sm:space-y-1.5 border-b border-slate-100/20 pb-2.5 sm:pb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">
            <HiOutlineSparkles size={12} /> Free Expert Advice
          </div>

          <h3
            className={`font-heading text-base sm:text-lg font-bold tracking-tight leading-snug ${
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

        {/* Phone & Email - Stacks smoothly on small mobile screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <select className={inputClass} {...register("interestedCountry")}>
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
        </div>

        {/* Message */}
        <div>
          <label className={labelClass}>Message or Question</label>
          <textarea
            rows={2}
            maxLength={2000}
            className={`${inputClass} resize-none`}
            placeholder="Ask us anything regarding university fees, hostel, or admission..."
            {...register("message")}
          />
        </div>

        {/* Action Button & Security Badge */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-coral py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 min-h-[44px]"
          >
            {isSubmitting
              ? "Connecting with Expert..."
              : "Get Free Counselling"}
          </button>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
            <HiOutlineShieldCheck
              className="text-emerald-500 shrink-0"
              size={14}
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
