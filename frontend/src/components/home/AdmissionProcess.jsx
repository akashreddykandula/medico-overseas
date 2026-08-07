import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlinePaperAirplane,
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

// Staggered Container Animation
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

// Step Card Slide & Spring Variant
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

// Line Progress Animation
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

const AdmissionProcess = () => (
  <section className="section-container overflow-hidden py-24">
    {/* Animated Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      <h2 className="section-heading">Your Admission Journey</h2>
      <p className="mt-4 text-navy-400">
        A clear, guided 5-step process from first call to first day of class.
      </p>
    </motion.div>

    <div className="relative mt-20">
      {/* Background Animated Connector Line for Desktop */}
      <div className="absolute left-10 right-10 top-8 hidden h-0.5 bg-navy-100 lg:block">
        <motion.div
          variants={lineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="h-full origin-left bg-gradient-to-r from-navy via-coral to-navy"
        />
      </div>

      {/* Steps Stagger Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5"
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            variants={stepVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative flex flex-col items-center text-center"
          >
            {/* Icon Circle Badge with Ring Pulse */}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white shadow-glow ring-4 ring-white transition-all duration-300 group-hover:scale-110 group-hover:bg-coral">
              <step.icon
                size={28}
                className="transition-transform duration-300 group-hover:rotate-6"
              />
            </div>

            {/* Step Counter Tag */}
            <span className="mt-4 inline-block rounded-full bg-coral-50 px-3 py-0.5 text-[10px] font-bold tracking-wider text-coral">
              STEP {i + 1}
            </span>

            {/* Step Title & Description */}
            <h3 className="mt-2 font-heading font-semibold text-navy-600 transition-colors group-hover:text-coral">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-400">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default AdmissionProcess;
