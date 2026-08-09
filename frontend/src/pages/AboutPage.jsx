import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineBadgeCheck,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineChevronDown,
  HiOutlineCheckCircle,
  HiOutlineGlobe,
  HiOutlineHome,
  HiOutlinePaperAirplane,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineIdentification,
} from "react-icons/hi";
import { FaWhatsapp, FaQuoteLeft } from "react-icons/fa";
import PageHero from "../components/common/PageHero";
import { useCounsellors } from "../hooks/useCounsellors";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// --- HERO BACKGROUND IMAGES ---
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2400&auto=format&fit=crop",
];

// --- DATA CONSTANTS ---
const STATS = [
  ["12+", "Years of Operation"],
  ["5,000+", "Students Placed"],
  ["6+", "Countries Served"],
  ["50+", "Partner Universities"],
];

const SUCCESS_STATS = [
  { label: "Visa Success Rate", value: "99.8%" },
  { label: "Admission Approval", value: "100%" },
  { label: "Student Satisfaction", value: "98.5%" },
  { label: "Parent Satisfaction", value: "99.2%" },
];

const MILESTONES = [
  {
    year: "2012",
    title: "Foundation",
    desc: "Established in Hyderabad to provide transparent MBBS overseas guidance.",
  },
  {
    year: "2015",
    title: "Expansion into Russia & Georgia",
    desc: "Signed direct tie-ups with top government medical universities.",
  },
  {
    year: "2018",
    title: "Crossed 2,000 Admissions",
    desc: "Expanded on-ground support teams and student hostels in partner cities.",
  },
  {
    year: "2021",
    title: "Central Asia Tie-ups",
    desc: "Added top NMC-approved universities in Kazakhstan, Kyrgyzstan & Uzbekistan.",
  },
  {
    year: "2024+",
    title: "5,000+ Doctors Milestone",
    desc: "Built full-stack FMGE/NExT online prep support for enrolled students.",
  },
];

const PARENT_TRUST = [
  {
    title: "24/7 Local Guardian Support",
    desc: "Dedicated Indian wardens and support staff present on-campus.",
  },
  {
    title: "100% Visa Assistance",
    desc: "End-to-end documentation, translation, and embassy file submission.",
  },
  {
    title: "Airport Pickup & Onboarding",
    desc: "Our team accompanies students right from Indian airports to their hostels.",
  },
  {
    title: "Hostel & Indian Mess",
    desc: "Guaranteed hygienic Indian vegetarian & non-vegetarian food mess facilities.",
  },
  {
    title: "NMC & FMGE/NExT Guidance",
    desc: "Curriculum aligned with Indian licensure requirements from Year 1.",
  },
  {
    title: "No Hidden Costs",
    desc: "100% transparent fee breakup directly payable to university accounts.",
  },
];

const JOURNEY_STEPS = [
  { step: "1", title: "Free Counselling", icon: HiOutlineChatAlt2 },
  { step: "2", title: "University Selection", icon: HiOutlineAcademicCap },
  { step: "3", title: "Documentation", icon: HiOutlineDocumentText },
  { step: "4", title: "Admission Letter", icon: HiOutlineBadgeCheck },
  { step: "5", title: "Visa Stamping", icon: HiOutlineIdentification },
  { step: "6", title: "Flight Booking", icon: HiOutlinePaperAirplane },
  { step: "7", title: "Airport Pickup", icon: HiOutlineGlobe },
  { step: "8", title: "Hostel Check-in", icon: HiOutlineHome },
];

const TEAMS = {
  operations: [
    { name: "K. Rajesh Kumar", role: "Head of Global Operations" },
    { name: "S. Meenakshi", role: "University Alliance Manager" },
  ],
  documentation: [
    { name: "P. Sravani", role: "Senior Verification Officer" },
    { name: "V. Anand", role: "Ministry Attestation Lead" },
  ],
  visa: [
    { name: "M. Farooq", role: "Embassy Liaison Manager" },
    { name: "A. Deepika", role: "Student Visa Specialist" },
  ],
  support: [
    { name: "D. Srinivas", role: "On-Ground Student Warden (Russia)" },
    { name: "N. Tatyana", role: "Hostel Coordinator (Georgia)" },
  ],
};

const OFFICES = [
  {
    city: "Hyderabad (Head Office)",
    address:
      "Suite 402, Education Tower, MG Road, Secunderabad, Telangana - 500003",
    phone: "+91 99999 88888",
    email: "hyderabad@medicooverseas.com",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.495094916298!2d78.486671!3d17.435759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a3a25d22f19%3A0x6a2c3f81e7d80000!2sSecunderabad!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin",
  },
  {
    city: "Vijayawada Branch",
    address:
      "Door No. 40-1-15, M.G. Road, Labbipet, Vijayawada, Andhra Pradesh - 520010",
    phone: "+91 88888 77777",
    email: "vijayawada@medicooverseas.com",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.432194916298!2d80.648011!3d16.506174!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35effa25d22f19%3A0x6a2c3f81e7d80000!2sVijayawada!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin",
  },
];

const FAQS = [
  {
    q: "Is MBBS from abroad recognized by the NMC in India?",
    a: "Yes, all partner universities recommended by Medico Overseas fulfill NMC regulations (minimum 5.5 years duration, English medium, internship included) and are listed with WHO.",
  },
  {
    q: "Do students get Indian food in university hostels?",
    a: "Yes! Almost all our major partner universities in Russia, Georgia, Kazakhstan, and Uzbekistan have dedicated Indian messes serving vegetarian and non-vegetarian meals.",
  },
  {
    q: "What is the role of Medico Overseas after admission?",
    a: "Our responsibility extends through your entire 6-year course. We handle airport pickup, hostel check-in, SIM card allotment, visa renewals, and NEXT/FMGE exam preparation guidance.",
  },
  {
    q: "Are NEET qualifications required for studying MBBS abroad?",
    a: "Yes, qualifying NEET-UG in the current year or preceding two years is mandatory for Indian students to practice in India after graduation.",
  },
];

const AboutPage = () => {
  const { data: counsellors = [], isLoading: isLoadingCounsellors } =
    useCounsellors();
  const [activeTab, setActiveTab] = useState("counsellors");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background Image Slider Auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us | Medico Overseas - Trusted MBBS Consultancy</title>
        <meta
          name="description"
          content="Learn about Medico Overseas' mission, founder's message, university tie-ups, team, timeline, and track record guiding 5000+ Indian medical students."
        />
        <link rel="canonical" href={window.location.href} />
        <meta
          property="og:title"
          content="About Us | Medico Overseas - Trusted MBBS Consultancy"
        />
        <meta
          property="og:description"
          content="Learn about Medico Overseas' mission, team, university partnerships, and experience helping Indian students pursue MBBS abroad."
        />
        <meta
          property="og:image"
          content={`${window.location.origin}/medicologo.png`}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Medico Overseas" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="About Us | Medico Overseas - Trusted MBBS Consultancy"
        />
        <meta
          name="twitter:description"
          content="Learn about Medico Overseas and our experience guiding Indian students toward MBBS opportunities abroad."
        />
        <meta
          name="twitter:image"
          content={`${window.location.origin}/medicologo.png`}
        />
      </Helmet>

      {/* Page Hero with Auto-sliding Background Images & Dark Overlay */}

      {/* ABOUT HERO — IMAGE BACKGROUND + NAVY OVERLAY */}
      <section className="relative min-h-[320px] overflow-hidden text-white sm:min-h-[350px]">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={HERO_IMAGES[currentImageIndex]}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2 },
              scale: { duration: 5, ease: "easeOut" },
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-[#071A38]/45" />

        {/* Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/65 via-[#102F5C]/50 to-[#071A38]/45" />

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[320px] items-center justify-center sm:min-h-[350px]">
          <PageHero
            eyebrow="ABOUT MEDICO OVERSEAS"
            title="A Safety-First Partner for Your Medical Career"
            subtitle="Founded to make globally recognized medical education accessible, transparent, and safe for Indian students."
            transparent
          />
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentImageIndex === index
                  ? "w-8 bg-coral"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Show background ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 1. Our Story & Numbers */}
      <section className="section-container py-20 overflow-hidden">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-coral-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-coral">
              <HiOutlineSparkles size={16} /> Our Story
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy-600 sm:text-4xl">
              Democratizing Foreign Medical Education Since 2012
            </h2>
            <p className="leading-relaxed text-navy-500 sm:text-lg">
              Medico Overseas was founded by a team of senior education
              counsellors and medical professionals who saw too many capable
              Indian students shut out of a medical career simply due to limited
              government seats.
            </p>
            <p className="leading-relaxed text-navy-500">
              We built a consultancy centered on 100% transparency: no hidden
              costs, no unrecognized universities, and honest guidance for every
              family. Today, we are proud to be one of India’s most trusted
              overseas medical education advisors.
            </p>
          </motion.div>

          {/* Mission & Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xl lg:col-span-5"
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-coral/10 blur-2xl" />
            <div className="relative space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-coral-50 p-3 text-coral">
                  <HiOutlineHeart size={24} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy-600">
                    Our Mission
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">
                    To guide ambitious students toward world-class, affordable
                    medical education with end-to-end ethical support and
                    safety.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-navy-50 p-3 text-navy-600">
                    <HiOutlineAcademicCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-navy-600">
                      Our Vision
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-navy-500">
                      To bridge global medical training with Indian healthcare
                      excellence, shaping the next generation of licensed
                      doctors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6"
        >
          {STATS.map(([value, label]) => (
            <motion.div
              key={label}
              variants={itemUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:border-coral/30 hover:shadow-lg"
            >
              <p className="font-heading text-3xl font-extrabold tracking-tight text-coral sm:text-4xl">
                {value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                {label}
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-50">
                <div className="h-full w-0 bg-coral transition-all duration-500 group-hover:w-full" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 2. Chairman & Founder Message */}
      <section className="border-t border-slate-100 bg-navy-900 py-20 text-white overflow-hidden">
        <div className="section-container grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto max-w-xs overflow-hidden rounded-3xl border-4 border-white/10 bg-white/5 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800"
                alt="Chairman / Founder"
                className="h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-7"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral">
              <FaQuoteLeft size={12} /> Leadership Message
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              "Every Student Deserves a Transparent Path to Becoming a Doctor"
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 italic">
              "When a student chooses to study MBBS abroad, they aren't just
              changing universities — they are trusting us with their lifelong
              dream. At Medico Overseas, we ensure every parent sleeps
              peacefully knowing their child is safe, supported, and studying in
              a recognized government medical institution."
            </p>
            <div>
              <p className="font-heading text-lg font-bold text-coral">
                Dr. V. K. Sharma
              </p>
              <p className="text-xs text-slate-400">
                Founder & Managing Director, Medico Overseas
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Company Timeline */}
      <section className="border-t border-slate-100 bg-white py-20 overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              OUR MILESTONES
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              A Decade of Excellence & Expansion
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-14 relative border-l-2 border-slate-100 pl-6 space-y-10 sm:mx-auto sm:max-w-2xl"
          >
            {MILESTONES.map((m, idx) => (
              <motion.div
                key={idx}
                variants={itemUp}
                className="relative group"
              >
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white ring-4 ring-white transition-transform duration-300 group-hover:scale-125">
                  ✓
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-coral/40 group-hover:shadow-md">
                  <span className="text-xs font-bold text-coral uppercase tracking-wider">
                    {m.year}
                  </span>
                  <h3 className="mt-1 font-heading text-base font-bold text-navy-600">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-xs text-navy-500 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Admission Success Statistics */}
      <section className="bg-navy-50 py-16">
        <div className="section-container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {SUCCESS_STATS.map((s, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm"
              >
                <p className="font-heading text-2xl font-bold text-navy-600 sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Why Parents Trust Medico Overseas */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="section-container">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              FAMILY FIRST
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              Why Parents Trust Medico Overseas
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {PARENT_TRUST.map((pt, idx) => (
              <motion.div
                key={idx}
                variants={itemUp}
                whileHover={{ y: -4 }}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-md hover:border-coral/30"
              >
                <HiOutlineCheckCircle
                  className="mt-0.5 shrink-0 text-coral"
                  size={24}
                />
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy-600">
                    {pt.title}
                  </h3>
                  <p className="mt-1 text-xs text-navy-500 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Student Journey Timeline */}
      <section className="py-20 bg-navy-900 text-white overflow-hidden">
        <div className="section-container">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              8-STEP ROADMAP
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              The Student Journey
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8"
          >
            {JOURNEY_STEPS.map((js, idx) => {
              const IconComp = js.icon;
              return (
                <motion.div
                  key={idx}
                  variants={scaleIn}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="flex flex-col items-center rounded-2xl bg-white/5 border border-white/10 p-4 text-center backdrop-blur-sm transition-colors hover:border-coral/50 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral font-bold text-white text-xs mb-2 shadow-md">
                    {js.step}
                  </div>
                  <IconComp className="text-slate-300 mb-1" size={20} />
                  <p className="text-[11px] font-bold text-white">{js.title}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 7. University Partnerships & Accreditations */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="section-container text-center space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              GLOBAL RECOGNITION
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              Accreditations & Recognition
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6"
          >
            {[
              "NMC Recognized",
              "WHO Listed",
              "FAIMER Registered",
              "ECFMG Certified",
              "ISO 9001:2015 Registered",
            ].map((badge, idx) => (
              <motion.div
                key={idx}
                variants={itemUp}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-full border border-slate-100 bg-navy-50/50 px-5 py-2.5 text-xs font-bold text-navy-600 shadow-sm transition-all hover:border-coral/40 hover:bg-coral-50/30"
              >
                <HiOutlineBadgeCheck size={18} className="text-coral" />
                <span>{badge}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8. Team Section (Tabs) */}
      <section className="bg-navy-50 py-20 border-t border-slate-100">
        <div className="section-container">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              MEET OUR EXPERTS
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              Dedicated Team Behind Your Dreams
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex justify-center gap-2 flex-wrap">
            {[
              { id: "counsellors", label: "Counsellors" },
              { id: "operations", label: "Operations Team" },
              { id: "documentation", label: "Documentation Team" },
              { id: "visa", label: "Visa Team" },
              { id: "support", label: "Student Support" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-coral text-white shadow-md scale-105"
                    : "bg-white text-navy-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {activeTab === "counsellors"
              ? isLoadingCounsellors
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-64 animate-pulse rounded-2xl bg-white p-6"
                    />
                  ))
                : counsellors.map((c) => (
                    <motion.div
                      key={c._id}
                      whileHover={{ y: -6 }}
                      className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-coral/30"
                    >
                      <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-navy-50 border-2 border-coral-50">
                        {c.avatar?.url || c.photoUrl ? (
                          <img
                            src={c.avatar?.url || c.photoUrl}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-navy-300">
                            <HiOutlineUserGroup size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 font-heading font-bold text-navy-600">
                        {c.name}
                      </h3>
                      <p className="text-xs text-navy-400">
                        {c.designation || "Senior Advisor"}
                      </p>
                    </motion.div>
                  ))
              : TEAMS[activeTab]?.map((member, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6 }}
                    className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-coral/30"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-50 text-navy-400 border-2 border-slate-100">
                      <HiOutlineUserGroup size={32} />
                    </div>
                    <h3 className="mt-4 font-heading font-bold text-navy-600">
                      {member.name}
                    </h3>
                    <p className="text-xs text-navy-400">{member.role}</p>
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* 9. Gallery Preview */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="section-container">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-coral">
                CAMPUS & DEPARTURES
              </span>
              <h2 className="font-heading text-xl font-bold text-navy-600">
                Life at Overseas Universities
              </h2>
            </div>
            <Link
              to="/gallery"
              className="text-xs font-bold text-coral hover:underline"
            >
              View Full Gallery →
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              "https://plus.unsplash.com/premium_photo-1683887034491-f58b4c4fca72?q=80&w=1469&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",
              "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
              "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
            ].map((img, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.03 }}
                className="h-44 overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
              >
                <img
                  src={img}
                  alt="Campus Life"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. Office Locations & Google Maps */}
      <section className="py-20 bg-navy-50 border-t border-slate-100">
        <div className="section-container space-y-12">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              VISIT OUR OFFICES
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              Our Physical Locations
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {OFFICES.map((office, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4"
              >
                <h3 className="font-heading text-lg font-bold text-navy-600">
                  {office.city}
                </h3>
                <div className="space-y-2 text-xs text-navy-500">
                  <p className="flex items-start gap-2">
                    <HiOutlineLocationMarker
                      size={16}
                      className="text-coral shrink-0 mt-0.5"
                    />
                    <span>{office.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlinePhone size={16} className="text-coral shrink-0" />
                    <span>{office.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <HiOutlineMail size={16} className="text-coral shrink-0" />
                    <span>{office.email}</span>
                  </p>
                </div>

                <div className="h-44 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  <iframe
                    title={office.city}
                    src={office.mapEmbed}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ Preview */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="section-container space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              GOT QUESTIONS?
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-coral/30"
              >
                <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-navy-600 marker:content-none">
                  <span>{faq.q}</span>
                  <HiOutlineChevronDown
                    size={16}
                    className="text-coral transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-xs text-navy-400 leading-relaxed">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/faqs"
              className="text-xs font-bold text-coral hover:underline"
            >
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Call To Action Section */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-800 py-16 text-white overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-container text-center space-y-4"
        >
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready to Begin Your MBBS Abroad Journey?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Book a free 1-on-1 counselling session with our senior advisors and
            choose the best university for your medical future.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/contact#enquiry"
              className="rounded-xl bg-coral px-6 py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:opacity-90"
            >
              Get Free Counselling
            </Link>
            <a
              href="https://wa.me/919999988888"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-emerald-500"
            >
              <FaWhatsapp size={16} /> WhatsApp Now
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default AboutPage;
