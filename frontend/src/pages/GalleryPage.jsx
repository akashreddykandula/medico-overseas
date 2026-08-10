import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiSparkles,
} from "react-icons/hi";
import api from "../lib/api";

const CATEGORIES = [
  "all",
  "campus",
  "hostel",
  "student_life",
  "office",
  "events",
  "graduation",
];
const GALLERY_HERO_IMAGE =
  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2400&auto=format&fit=crop";

// Expanded fallback high-resolution photos if the database has no records yet
const DEFAULT_GALLERY = [
  {
    _id: "def-1",
    title: "State Medical University Campus",
    category: "campus",
    description:
      "Modern academic buildings equipped with state-of-the-art medical labs.",
    image: {
      url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-2",
    title: "International Student Hostel",
    category: "hostel",
    description:
      "Comfortable, fully furnished student accommodations with 24/7 security.",
    image: {
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-3",
    title: "Clinical Practical Session",
    category: "student_life",
    description:
      "Hands-on medical training and practical workshops for medical students.",
    image: {
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-4",
    title: "Annual Convocation & Graduation",
    category: "graduation",
    description:
      "Celebrating Indian medical graduates completing their MBBS degree.",
    image: {
      url: "https://images.unsplash.com/photo-1496469888073-80de7e952517?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    _id: "def-5",
    title: "Cultural Evening & Diwali Fest",
    category: "events",
    description:
      "Indian cultural festival celebrations organized by student associations.",
    image: {
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-6",
    title: "Medico Overseas Head Office",
    category: "office",
    description:
      "Our dedicated student counselling and documentation support center.",
    image: {
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-7",
    title: "Central University Library",
    category: "campus",
    description:
      "Extensive collection of medical journals, books, and digital resources.",
    image: {
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-8",
    title: "Student Lounge & Recreation",
    category: "student_life",
    description:
      "Relaxation areas for students to unwind between practical lectures.",
    image: {
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-9",
    title: "Modern Anatomy Simulation Lab",
    category: "campus",
    description:
      "Advanced 3D virtual dissection tables and anatomical learning models.",
    image: {
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-10",
    title: "Hostel Dining Hall & Indian Mess",
    category: "hostel",
    description:
      "Hygienic campus mess facilities serving nutritious Indian vegetarian and non-vegetarian meals.",
    image: {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-11",
    title: "Interactive Medical Lecture Theatre",
    category: "campus",
    description:
      "Tiered auditorium equipped with smart boards and audio-visual teaching aids.",
    image: {
      url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-12",
    title: "Cricket & Sports Tournament",
    category: "events",
    description:
      "Annual sports meet featuring inter-university cricket and football championships.",
    image: {
      url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-13",
    title: "Medical Consultation Guidance Desk",
    category: "office",
    description:
      "1-on-1 counseling session guiding aspirants through university selection and visa processes.",
    image: {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-14",
    title: "Group Study & Clinical Discussions",
    category: "student_life",
    description:
      "Students collaborating on medical case studies and clinical problem-solving.",
    image: {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-15",
    title: "Graduation Oath & Hippocratic Ceremony",
    category: "graduation",
    description:
      "Graduating doctors taking the Hippocratic Oath alongside faculty mentors.",
    image: {
      url: "https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    _id: "def-16",
    title: "University Study Room & Dorm Desk",
    category: "hostel",
    description:
      "Quiet personal study setups in single and double sharing hostel rooms.",
    image: {
      url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-17",
    title: "University Hospital Ward Rounds",
    category: "student_life",
    description:
      "Senior medical students attending real-time clinical rounds under attending physicians.",
    image: {
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    _id: "def-18",
    title: "Holi & Festival Celebrations On Campus",
    category: "events",
    description:
      "Joyful festival of colors celebrated by Indian students studying abroad.",
    image: {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
  },
];

const useGallery = (category) =>
  useQuery({
    queryKey: ["gallery", category],
    queryFn: async () => {
      try {
        const { data } = await api.get("/gallery", {
          params: category !== "all" ? { category } : {},
        });

        let apiItems = [];

        if (Array.isArray(data)) apiItems = data;
        else if (Array.isArray(data?.data)) apiItems = data.data;
        else if (Array.isArray(data?.data?.items)) apiItems = data.data.items;
        else if (Array.isArray(data?.items)) apiItems = data.items;

        return apiItems;
      } catch (err) {
        console.error("Gallery API request failed:", err);
        throw err;
      }
    },
  });

const GalleryPage = () => {
  const [category, setCategory] = useState("all");
  const { data: apiItems = [], isLoading, isError } = useGallery(category);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Combine API results with Default Fallback Items
  const filteredDefaultItems =
    category === "all"
      ? DEFAULT_GALLERY
      : DEFAULT_GALLERY.filter((item) => item.category === category);

  const items = apiItems.length > 0 ? apiItems : filteredDefaultItems;

  const selectedPhoto = lightboxIndex !== null ? items[lightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null && items.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % items.length);
    }
  }, [lightboxIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null && items.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [lightboxIndex, items.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  // Prevent background scroll when Lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <>
      <Helmet>
        <title>Gallery | Medico Overseas</title>
        <meta
          name="description"
          content="Explore campus, hostel, and student life photos from our partner universities abroad."
        />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:title" content="Gallery | Medico Overseas" />
        <meta
          property="og:description"
          content="Explore campus, hostel, and student life photos from our partner universities abroad."
        />
        <meta
          property="og:image"
          content={`${window.location.origin}/medicologo.png`}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Medico Overseas" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gallery | Medico Overseas" />
        <meta
          name="twitter:description"
          content="Explore campus, hostel, and student life photos from our partner universities abroad."
        />
        <meta
          name="twitter:image"
          content={`${window.location.origin}/medicologo.png`}
        />
      </Helmet>

      {/* Gallery Hero */}
      <section className="relative min-h-[320px] overflow-hidden text-white sm:min-h-[350px]">
        {/* Background Image */}
        <motion.img
          src={GALLERY_HERO_IMAGE}
          alt="Medical university campus and student life"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 5, ease: "easeOut" },
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-[#071A38]/55" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/70 via-[#102F5C]/50 to-[#071A38]/55" />

        {/* Centered Content */}
        <div className="relative z-10 flex min-h-[320px] items-center justify-center sm:min-h-[350px]">
          <div className="section-container text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Eyebrow */}
              <span className="mt-14 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200 backdrop-blur-sm">
                LIFE ABROAD
              </span>

              {/* Title */}
              <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">
                Campus & Student Life Gallery
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                A glimpse into campuses, hostels, and student life at our
                partner medical universities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="section-container relative py-16 font-sans">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((c) => {
            const isActive = category === c;
            return (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setLightboxIndex(null);
                }}
                className={`relative rounded-full px-5 py-2 text-xs font-bold capitalize transition-all duration-200 ${
                  isActive
                    ? "bg-coral text-white shadow-md shadow-coral/25"
                    : "bg-navy-50 text-navy-500 hover:bg-navy-100 hover:text-navy-700"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryIndicator"
                    className="absolute inset-0 rounded-full bg-coral -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span>
                  {c === "all"
                    ? "All"
                    : c
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Masonry Layout */}
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {isError && (
            <div className="mb-8 break-inside-avoid rounded-2xl border border-red-100 bg-red-50/60 p-8 text-center sm:col-span-2 lg:col-span-3">
              <p className="font-heading text-lg font-bold text-navy-600">
                Unable to load gallery
              </p>
              <p className="mt-2 text-xs leading-relaxed text-navy-400">
                We couldn't load the gallery from the server right now. Please
                try again later.
              </p>
            </div>
          )}
          {/* Skeleton Loaders */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 h-64 w-full animate-pulse rounded-2xl bg-navy-50"
              />
            ))}

          {/* Gallery Items */}
          {!isLoading &&
            !isError &&
            items.map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                onClick={() => setLightboxIndex(i)}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-navy-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                {/* Image */}
                <img
                  src={item.image?.url || item.url || item.imageUrl}
                  alt={item.title || "Gallery photo"}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Glassmorphism Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
                  <div className="transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-coral/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      <HiSparkles size={11} />
                      {item.category?.replace("_", " ") || "Gallery"}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-white line-clamp-1">
                      {item.title || "Partner Campus View"}
                    </h3>
                    {item.description && (
                      <p className="mt-1 text-xs text-slate-200 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
                    <HiOutlineEye size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 p-4 sm:p-8 backdrop-blur-2xl"
          >
            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between px-2 text-white sm:top-6 sm:left-8 sm:right-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-coral">
                  {lightboxIndex + 1} / {items.length}
                </span>
                <span className="hidden text-xs font-medium text-slate-300 sm:inline-block capitalize">
                  {selectedPhoto.category?.replace("_", " ")}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-coral hover:text-white backdrop-blur-md"
                aria-label="Close Lightbox"
              >
                <HiOutlineX size={22} />
              </button>
            </div>

            {/* Navigation Buttons */}
            {items.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-coral hover:scale-105 active:scale-95"
                  aria-label="Previous image"
                >
                  <HiOutlineChevronLeft size={24} />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-3 sm:right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-coral hover:scale-105 active:scale-95"
                  aria-label="Next image"
                >
                  <HiOutlineChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Box */}
            <div className="relative max-h-[80vh] max-w-5xl overflow-hidden rounded-2xl bg-black/40 p-2 shadow-2xl">
              <motion.img
                key={selectedPhoto._id || lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={
                  selectedPhoto.image?.url ||
                  selectedPhoto.url ||
                  selectedPhoto.imageUrl
                }
                alt={selectedPhoto.title || "Gallery Preview"}
                className="max-h-[72vh] w-auto max-w-full object-contain mx-auto rounded-xl"
              />

              {(selectedPhoto.title || selectedPhoto.description) && (
                <div className="mt-3 text-center text-white px-4 pb-2">
                  {selectedPhoto.title && (
                    <h3 className="font-heading text-lg font-bold text-white">
                      {selectedPhoto.title}
                    </h3>
                  )}
                  {selectedPhoto.description && (
                    <p className="mt-1 text-xs text-slate-300 max-w-2xl mx-auto">
                      {selectedPhoto.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GalleryPage;
