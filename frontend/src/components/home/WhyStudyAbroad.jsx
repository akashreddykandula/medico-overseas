import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineGlobeAlt,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
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

// Container animation stagger settings
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

// Individual card entry & hover physics settings
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
  <section className="section-container relative overflow-hidden py-24">
    {/* Background Decorative Ambient Glows */}
    <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-navy-50/50 blur-3xl" />
    <div className="pointer-events-none absolute right-10 bottom-10 -z-10 h-72 w-72 rounded-full bg-coral/5 blur-3xl" />

    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl text-center"
    >
      <h2 className="section-heading">Why Study MBBS Abroad?</h2>
      <p className="mt-4 text-navy-400">
        Thousands of Indian students choose to study medicine abroad every year
        — here's why it might be right for you too.
      </p>
    </motion.div>

    {/* Interactive Grid Container */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {REASONS.map((r) => (
        <motion.div
          key={r.title}
          variants={cardVariants}
          whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-coral/30 hover:shadow-glow"
        >
          {/* Subtle Accent Light Border Shift on Hover */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-coral to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div>
            {/* Animated Icon Container */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy transition-all duration-300 group-hover:scale-110 group-hover:bg-coral group-hover:text-white group-hover:shadow-md group-hover:shadow-coral/20">
              <r.icon
                size={26}
                className="transition-transform duration-300 group-hover:rotate-6"
              />
            </div>

            {/* Title */}
            <h3 className="mt-5 font-heading text-lg font-semibold text-navy-600 transition-colors duration-300 group-hover:text-navy">
              {r.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm leading-relaxed text-navy-400">
              {r.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default WhyStudyAbroad;
