import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight, HiAcademicCap, HiPhone } from "react-icons/hi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1583373834259-46cc92173cb7?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Russia Medical Universities",
    subtitle: "Moscow • Kazan • St. Petersburg",
  },
  {
    url: "https://images.unsplash.com/photo-1647083423730-ea9567142412?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Georgia Medical Universities",
    subtitle: "Tbilisi • Batumi • Kutaisi",
  },
  {
    url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Armenia Medical Universities",
    subtitle: "Yerevan State Medical University",
  },
  {
    url: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1470&auto=format&fit=crop",
    title: "Armenia Medical Universities",
    subtitle: "Yerevan • Gyumri",
  },
  {
    url: "https://images.unsplash.com/photo-1558588942-930faae5a389?q=80&w=1470&auto=format&fit=crop",
    title: "Kazakhstan Medical Universities",
    subtitle: "Almaty • Astana",
  },
  {
    url: "https://images.unsplash.com/photo-1652487308763-4e9cee456d12?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Uzbekistan Medical Universities",
    subtitle: "Tashkent • Samarkand",
  },
  {
    url: "https://images.unsplash.com/photo-1565963479542-3cf82a9ee7e9?q=80&w=1346&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaGdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Russia Medical Universities",
    subtitle: "Moscow • Kazan",
  },
  {
    url: "https://plus.unsplash.com/premium_photo-1765987838916-bd0a10bbb476?q=80&w=1432&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaGdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Georgia Medical Universities",
    subtitle: "Tbilisi • Batumi",
  },
  {
    url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1470&auto=format&fit=crop",
    title: "Kyrgyzstan Medical Universities",
    subtitle: "Bishkek • Osh",
  },
  {
    url: "https://images.unsplash.com/photo-1681782421891-5088f13466ec?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Vietnam Medical Universities",
    subtitle: "Hanoi • Ho Chi Minh City",
  },
  {
    url: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "India Medical Education",
    subtitle: "Delhi • Mumbai",
  },
];

const STATS = [
  ["12+", "Years Experience"],
  ["5000+", "Students Placed"],
  ["50+", "Partner Universities"],
  ["6", "Countries Covered"],
];

const Hero = () => {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <section className="relative flex min-h-[92vh] w-full items-center overflow-hidden bg-navy pb-24 pt-36">
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
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
            <SwiperSlide key={`${item.title}-${index}`}>
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${item.url}")` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" />
      </motion.div>

      <div
        className="pointer-events-none absolute -left-32 top-20 h-80 w-80 animate-float rounded-full bg-coral/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 animate-float rounded-full bg-navy-400/30 blur-3xl"
        style={{ animationDelay: "2s" }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex max-w-4xl flex-col items-start"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200 backdrop-blur-md"
          >
            <HiAcademicCap className="text-sm text-coral" aria-hidden="true" />
            <span>NMC / WHO RECOGNIZED UNIVERSITIES</span>
          </motion.div>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Study <span className="text-coral">MBBS Abroad</span>
            <br />
            at Globally Recognized
            <br />
            Medical Universities
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Get expert admission guidance for NMC-approved universities in
            Georgia, Russia, Uzbekistan, Kazakhstan, Armenia, and more. We
            handle admissions, documentation, visa processing, travel, and
            post-arrival support—all under one roof.
          </p>

          <div className="mt-8 flex w-full flex-wrap gap-4 sm:w-auto">
            <a
              href="#enquiry"
              className="btn-primary group flex items-center justify-center gap-2"
            >
              Get Free Counselling
              <HiPhone
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            <Link
              to="/portal/apply"
              className="btn-outline flex items-center justify-center gap-2 !border-white/30 !text-white hover:!bg-white hover:!text-navy"
            >
              <HiArrowRight className="text-coral" aria-hidden="true" />
              Apply Now
            </Link>
          </div>

          <div className="mt-14 grid w-full grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
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
                <p className="mt-1 text-xs text-navy-200">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
