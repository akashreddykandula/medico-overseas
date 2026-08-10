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

const ExamsTeaser = () => {
  return (
    <section className="relative overflow-hidden bg-[#071A38] py-16 sm:py-24 text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute right-5 sm:right-10 top-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="section-container relative z-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-coral backdrop-blur-md">
            <HiSparkles size={14} aria-hidden="true" />
            Medical Licensing
          </span>

          <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Beyond Admission: Licensing Support
          </h2>

          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-slate-300">
            We stay with you through graduation and licensing — a full-journey
            partner, not just an admissions agent.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2"
        >
          {EXAMS.map((exam) => (
            <motion.div
              key={exam.slug}
              variants={cardVariants}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-5 sm:p-7 backdrop-blur-xl shadow-2xl transition-transform transition-shadow duration-300 ease-out hover:border-coral/50 hover:shadow-coral/20 hover:-translate-y-1.5 sm:flex-row sm:items-start sm:gap-6"
            >
              {/* Clean Glow Overlay on Hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-coral/15 via-transparent to-sky-500/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div
                className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-coral shadow-inner border border-white/10 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-coral group-hover:text-white"
                aria-hidden="true"
              >
                <HiOutlineClipboardCheck
                  size={26}
                  className="transition-transform duration-300 group-hover:rotate-6 sm:text-[28px]"
                />
              </div>

              <div className="relative z-10 mt-4 sm:mt-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white transition-colors duration-300 group-hover:text-coral">
                    {exam.title}
                  </h3>

                  <span className="rounded-full bg-white/10 border border-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md">
                    {exam.badge}
                  </span>
                </div>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {exam.desc}
                </p>

                <Link
                  to={`/exams/${encodeURIComponent(exam.slug)}`}
                  className="mt-4 sm:mt-6 inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-coral transition-all duration-300 group-hover:gap-3 group-hover:text-white"
                  aria-label={`Learn more about ${exam.title}`}
                >
                  <span>Learn More</span>
                  <HiArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ExamsTeaser;
