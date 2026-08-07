import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight, HiAcademicCap, HiPhone } from "react-icons/hi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

// High-resolution medical university and international campus imagery
const HERO_IMAGES = [
  {
    url: "https://plus.unsplash.com/premium_photo-1764691415779-1240207e7c51?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Russia Medical Universities",
    subtitle: "Moscow • Kazan • St. Petersburg",
  },
  {
    url: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1600&q=80",
    title: "Georgia Medical Universities",
    subtitle: "Tbilisi • Batumi • Kutaisi",
  },
  {
    url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Armenia Medical Universities",
    subtitle: "Yerevan State Medical University",
  },
  {
    url: "https://images.unsplash.com/20/cambridge.JPG?q=80&w=1447&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Kazakhstan Medical Universities",
    subtitle: "Almaty • Astana",
  },
  {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Uzbekistan Medical Universities",
    subtitle: "Tashkent • Samarkand",
  },
];

const STATS = [
  ["12+", "Years Experience"],
  ["5000+", "Students Placed"],
  ["50+", "Partner Universities"],
  ["6", "Countries Covered"],
];

const Hero = () => {
  // Parallax Scroll Effect
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-navy pb-24 pt-36 flex items-center">
      {/* 1. Scroll-Based Parallax Background Image Slider */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          loop
          speed={2000}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          className="h-full w-full opacity-25"
        >
          {HERO_IMAGES.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.url})` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient Overlays for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" />
      </motion.div>

      {/* 2. Floating Ambient Glow Orbs */}
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-coral/20 blur-3xl animate-float pointer-events-none" />
      <div
        className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-navy-400/30 blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      {/* 3. Main Hero Content */}
      <div className="section-container relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-start"
        >
          {/* Tag Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200 backdrop-blur-md"
          >
            <HiAcademicCap className="text-coral text-sm" />
            <span>NMC / WHO RECOGNIZED UNIVERSITIES</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Study <span className="text-coral">MBBS Abroad</span>
            <br />
            at Globally Recognized
            <br />
            Medical Universities
          </h1>

          {/* Subtext */}
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Get expert admission guidance for NMC-approved universities in
            Georgia, Russia, Uzbekistan, Kazakhstan, Armenia, and more. We
            handle admissions, documentation, visa processing, travel, and
            post-arrival support—all under one roof.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 w-full sm:w-auto">
            <a
              href="#enquiry"
              className="btn-primary group flex items-center justify-center gap-2"
            >
              Get Free Counselling{" "}
              <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <Link
              to="/destinations/mbbs-in-armenia"
              className="btn-outline flex items-center justify-center gap-2 !border-white/30 !text-white hover:!bg-white hover:!text-navy"
            >
              <HiPhone className="text-coral" /> Explore Universities
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full pt-8 border-t border-white/10">
            {STATS.map(([value, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <p className="font-heading text-2xl font-bold text-coral sm:text-3xl">
                  {value}
                </p>
                <p className="text-xs text-navy-200 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
