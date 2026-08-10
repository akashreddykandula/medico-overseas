import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineGlobeAlt,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiSparkles,
} from "react-icons/hi";

const REASONS = [
  {
    icon: HiOutlineCurrencyDollar,
    title: "Affordable Tuition",
    desc: "Quality medical education at a fraction of private-college costs in India, with no capitation fees.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Globally Recognized",
    desc: "NMC and WHO-recognized universities, so your degree is valid for practice in India and abroad.",
  },
  {
    icon: HiOutlineGlobeAlt,
    title: "No Donation, No Capitation",
    desc: "Direct, transparent admissions — merit-based seats without donation or management quota costs.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "End-to-End Support",
    desc: "From documentation to visa to FMGE prep — we stay with you through the entire journey.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const WhyStudyAbroad = () => (
  <section className="relative overflow-hidden bg-white py-24 text-navy-800">
    {/* Soft Ambient Background Backlights */}
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-sky-500/5 blur-[120px]"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-coral/5 blur-[100px]"
      aria-hidden="true"
    />

    <div className="section-container relative z-10">
      {/* Header Badge & Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-100 bg-coral-50/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-coral shadow-2xs backdrop-blur-md">
          <HiSparkles size={14} aria-hidden="true" />
          Smart Career Choice
        </span>

        <h2 className="mt-4 font-heading text-3xl font-extrabold text-navy-700 sm:text-4xl lg:text-5xl">
          Why Study MBBS Abroad?
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          Thousands of Indian students choose to study medicine abroad every
          year — here's why it might be right for you too.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {REASONS.map((reason, index) => {
          const Icon = reason.icon;

          return (
            <motion.div
              key={reason.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-100/60 transition-all duration-500 hover:border-coral/40 hover:shadow-2xl hover:shadow-coral/10"
            >
              {/* Subtle Animated Glow Effect on Hover */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
                <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#ff6b6b_0deg,transparent_120deg,#38bdf8_240deg,transparent_360deg)] opacity-10" />
              </div>

              {/* Watermark Index Counter */}
              <span className="pointer-events-none absolute right-5 top-4 font-heading text-4xl font-black text-slate-100 transition-colors duration-300 group-hover:text-coral/10">
                0{index + 1}
              </span>

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 text-coral shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:border-coral group-hover:bg-coral group-hover:text-white group-hover:shadow-lg group-hover:shadow-coral/25">
                  <Icon
                    size={28}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:rotate-6"
                  />
                </div>

                <h3 className="mt-6 font-heading text-xl font-bold text-navy-700 transition-colors duration-300 group-hover:text-coral">
                  {reason.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">
                  {reason.desc}
                </p>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase group-hover:text-coral transition-colors">
                  Key Advantage
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 transition-all duration-300 group-hover:w-5 group-hover:bg-coral" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default WhyStudyAbroad;
