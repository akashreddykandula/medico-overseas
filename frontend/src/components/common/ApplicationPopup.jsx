import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineAcademicCap,
  HiOutlineX,
  HiArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi";

const ApplicationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur & Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 hover:rotate-90"
              aria-label="Close application popup"
            >
              <HiOutlineX size={18} />
            </button>

            {/* Decorative Glow Orbs */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E15B3F]/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-[#1F3864]/10 blur-2xl" />

            {/* Modal Body */}
            <div className="relative">
              {/* Badge & Icon Header */}
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E15B3F]/20 to-[#E15B3F]/5 text-[#E15B3F] ring-1 ring-[#E15B3F]/20">
                  <HiOutlineAcademicCap size={28} />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E15B3F] text-[10px] text-white">
                    <HiOutlineSparkles size={10} />
                  </span>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E15B3F]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#E15B3F]">
                    Admissions Open
                  </span>
                  <h3 className="mt-1 font-heading text-xl font-extrabold leading-snug text-[#1F3864]">
                    Planning to Study MBBS Abroad?
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                Take the first step toward your global medical career. Apply
                today for personalized university matching and verified
                guidance.
              </p>

              {/* Mini Highlights */}
              <div className="mt-4 flex flex-wrap gap-2.5">
                {[
                  "NMC & WHO Recognized",
                  "Zero Donation",
                  "100% Visa Support",
                ].map((perk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                  >
                    <HiOutlineCheckCircle
                      className="text-[#E15B3F]"
                      size={14}
                    />
                    {perk}
                  </span>
                ))}
              </div>

              {/* CTA Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to="/portal/apply"
                  onClick={() => setIsOpen(false)}
                  className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#E15B3F] to-[#d4482b] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#E15B3F]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E15B3F]/35 active:scale-[0.98]"
                >
                  <span className="relative z-10">Apply Now</span>
                  <HiArrowRight
                    size={16}
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  />
                  <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationPopup;
