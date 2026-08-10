import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlinePaperAirplane,
  HiSparkles,
} from "react-icons/hi";

const STEPS = [
  {
    icon: HiOutlineChatAlt2,
    title: "Consultation",
    desc: "Free counselling to understand your goals and budget.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "Documentation",
    desc: "We help gather and verify all required documents.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "University Selection",
    desc: "Shortlist NMC/WHO-recognized universities that fit you.",
  },
  {
    icon: HiOutlineGlobe,
    title: "Visa",
    desc: "End-to-end visa filing and interview preparation support.",
  },
  {
    icon: HiOutlinePaperAirplane,
    title: "Departure",
    desc: "Travel briefing, ticketing support, and arrival assistance.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 110,
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

const mobileLineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

const AdmissionProcess = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white py-16 sm:py-24">
      {/* Premium Ambient Background Backlights */}
      <div
        className="pointer-events-none absolute left-1/2 top-10 -z-10 h-80 w-80 sm:h-96 sm:w-96 -translate-x-1/2 rounded-full bg-coral/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="section-container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-100 bg-coral-50/80 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-coral shadow-2xs backdrop-blur-md">
            <HiSparkles size={14} aria-hidden="true" />
            Simple 5-Step Roadmap
          </span>

          <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-navy-700 tracking-tight">
            Your Admission Journey
          </h2>

          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-slate-600">
            A clear, guided 5-step process from first call to first day of
            class.
          </p>
        </motion.div>

        <div className="relative mt-12 sm:mt-20">
          {/* Desktop Connecting Line */}
          <div className="absolute left-10 right-10 top-10 hidden h-0.5 bg-slate-200/80 lg:block">
            <motion.div
              variants={lineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="h-full origin-left bg-gradient-to-r from-navy-600 via-coral to-sky-500"
            />
          </div>

          {/* Mobile Vertical Connecting Line */}
          <div className="absolute left-7 top-8 bottom-8 block w-0.5 bg-slate-200/80 lg:hidden">
            <motion.div
              variants={mobileLineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="w-full h-full origin-top bg-gradient-to-b from-navy-600 via-coral to-sky-500"
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-5"
          >
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  variants={stepVariants}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center gap-5 lg:gap-0"
                >
                  {/* Step Icon Badge */}
                  <div className="relative z-10 flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-navy-700 text-white shadow-xl shadow-navy-700/15 border-2 border-white ring-4 ring-slate-100/80 transition-all duration-300 group-hover:scale-110 group-hover:bg-coral group-hover:shadow-coral/30 group-hover:ring-coral/20">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:rotate-6" />
                  </div>

                  {/* Step Content Wrapper (Glassmorphism Card on Mobile) */}
                  <div className="flex-1 lg:flex-initial rounded-2xl lg:rounded-none border border-slate-100 lg:border-none bg-white lg:bg-transparent p-4 sm:p-5 lg:p-0 shadow-sm lg:shadow-none transition-all duration-300 group-hover:border-coral/30">
                    <span className="inline-block lg:mt-5 rounded-full border border-coral-100 bg-coral-50/80 px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-coral uppercase">
                      STEP {index + 1}
                    </span>

                    <h3 className="mt-1.5 sm:mt-2 font-heading text-base sm:text-lg font-bold text-navy-700 transition-colors duration-300 group-hover:text-coral">
                      {step.title}
                    </h3>

                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionProcess;
