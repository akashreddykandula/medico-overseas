import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiArrowRight,
  HiOutlineClipboardCheck,
  HiSparkles,
} from "react-icons/hi";

const EXAMS = [
  {
    title: "FMGE Exam",
    slug: "fmge",
    desc: "The licensing exam required for MBBS graduates from abroad to practice medicine in India.",
    badge: "India Practice",
  },
  {
    title: "NMAT Exam",
    slug: "nmat",
    desc: "Understand eligibility, exam pattern, and how we support your preparation and registration.",
    badge: "Eligibility & Prep",
  },
];

// Staggered Container Variant
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Exam Card Reveal Variant
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 110,
    },
  },
};

const ExamsTeaser = () => (
  <section className="section-container overflow-hidden py-24">
    {/* Animated Section Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral">
        <HiSparkles size={14} /> Medical Licensing
      </span>
      <h2 className="section-heading mt-3">
        Beyond Admission: Licensing Support
      </h2>
      <p className="mt-4 leading-relaxed text-navy-400">
        We stay with you through graduation and licensing — a full-journey
        partner, not just an admissions agent.
      </p>
    </motion.div>

    {/* Animated Cards Grid */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      {EXAMS.map((exam) => (
        <motion.div
          key={exam.slug}
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.25 } }}
          className="group relative flex flex-col justify-between rounded-2xl border border-navy-100 bg-white p-7 shadow-sm transition-all duration-300 hover:border-coral/30 hover:shadow-xl sm:flex-row sm:items-start sm:gap-6"
        >
          {/* Icon Circle with Hover Effects */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral shadow-sm ring-1 ring-coral/10 transition-transform duration-300 group-hover:scale-105 group-hover:bg-coral group-hover:text-white">
            <HiOutlineClipboardCheck
              size={28}
              className="transition-transform duration-300 group-hover:rotate-6"
            />
          </div>

          <div className="mt-4 flex-1 sm:mt-0">
            {/* Header Title & Floating Badge */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-xl font-bold text-navy-600 transition-colors group-hover:text-coral">
                {exam.title}
              </h3>
              <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-500">
                {exam.badge}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-navy-400">
              {exam.desc}
            </p>

            {/* CTA Link */}
            <Link
              to={`/exams/${exam.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-coral transition-all duration-200 group-hover:gap-2.5"
            >
              <span>Learn More</span>
              <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default ExamsTeaser;
