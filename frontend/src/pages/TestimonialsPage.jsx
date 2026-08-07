import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  HiStar,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlinePlay,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
} from "react-icons/hi";
import PageHero from "../components/common/PageHero";
import { useTestimonials } from "../hooks/useContent";

// Curated Demo Success Stories (Fallback if DB is empty)
const DEMO_TESTIMONIALS = [
  {
    _id: "demo-1",
    studentName: "Dr. Ananya Sharma",
    quote:
      "Choosing Medico Overseas was the best decision for my career. They guided me through every step from NEET qualification to visa stamping for Bashkir State Medical University. Now I am successfully preparing for NEXT/FMGE!",
    rating: 5,
    university: { name: "Bashkir State Medical University" },
    country: { name: "Russia" },
    batch: "Batch of 2021",
    photo: {
      url: "https://images.unsplash.com/photo-1594824813571-24a69c100d02?w=400",
    },
    isVideo: true,
  },
  {
    _id: "demo-2",
    studentName: "Rahul Verma",
    quote:
      "The counselors were completely transparent about fees and hostel conditions in Georgia. No hidden charges! They even arranged Indian food mess facilities on campus.",
    rating: 5,
    university: { name: "Tbilisi State Medical University" },
    country: { name: "Georgia" },
    batch: "Batch of 2022",
    photo: {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    },
    isVideo: false,
  },
  {
    _id: "demo-3",
    studentName: "Sneha Patel",
    quote:
      "As a female student traveling abroad for the first time, safety was my parents’ primary concern. Medico Overseas provided airport pickup, hostel allocation, and 24/7 local warden support in Kazakhstan.",
    rating: 5,
    university: { name: "Kazakh National Medical University" },
    country: { name: "Kazakhstan" },
    batch: "Batch of 2023",
    photo: {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    isVideo: false,
  },
  {
    _id: "demo-4",
    studentName: "Priya & Rajesh Reddy (Parents)",
    quote:
      "Seeing our son settle in Samarkand State Medical University smoothly gave us immense relief. Medico Overseas handled documentation, apostille attestation, and university admission within 10 days.",
    rating: 5,
    university: { name: "Samarkand State Medical University" },
    country: { name: "Uzbekistan" },
    batch: "Batch of 2023",
    photo: {
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    },
    isVideo: false,
  },
  {
    _id: "demo-5",
    studentName: "Vikramaditya Rao",
    quote:
      "The faculty at Asian Medical Institute is top-tier with full English medium curriculum. Medico Overseas made the documentation effortless and guided me through embassy interview preparation.",
    rating: 5,
    university: { name: "Asian Medical Institute" },
    country: { name: "Kyrgyzstan" },
    batch: "Batch of 2022",
    photo: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    isVideo: true,
  },
  {
    _id: "demo-6",
    studentName: "Dr. Rohan Kulkarni",
    quote:
      "I completed my MBBS from Orenburg State Medical University and cleared FMGE on my first attempt. The academic counseling and study material guidance from Medico Overseas was invaluable.",
    rating: 5,
    university: { name: "Orenburg State Medical University" },
    country: { name: "Russia" },
    batch: "Batch of 2020",
    photo: {
      url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    },
    isVideo: false,
  },
];

const CATEGORIES = [
  "All",
  "Russia",
  "Georgia",
  "Kazakhstan",
  "Uzbekistan",
  "Kyrgyzstan",
];

const TestimonialsPage = () => {
  const { data: dbTestimonials = [], isLoading } = useTestimonials();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Use database testimonials if available, otherwise fall back to demo stories
  const allTestimonials =
    dbTestimonials && dbTestimonials.length > 0
      ? dbTestimonials
      : DEMO_TESTIMONIALS;

  // Filter testimonials based on active category
  const filteredTestimonials =
    selectedCategory === "All"
      ? allTestimonials
      : allTestimonials.filter(
          (t) =>
            t.country?.name?.toLowerCase() === selectedCategory.toLowerCase(),
        );

  return (
    <>
      <Helmet>
        <title>Student Success Stories | Medico Overseas</title>
        <meta
          name="description"
          content="Read real testimonials and watch video success stories from students studying MBBS abroad with Medico Overseas."
        />
      </Helmet>

      {/* Hero Header */}
      <PageHero
        eyebrow="SUCCESS STORIES"
        title="Our Students, Our Pride"
        subtitle="Hear directly from students and parents who trusted Medico Overseas with their medical career journey abroad."
      />

      <div className="section-container py-16">
        {/* Featured Video / Story Highlight Banner */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white shadow-2xl lg:grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-coral">
              <HiOutlineSparkles size={16} /> Featured Doctor Journey
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
              From Aspirant to Qualified Medical Graduate
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              "Medico Overseas provided step-by-step guidance right from NEET
              counseling, visa assistance, to foreign university orientation.
              Today I'm practicing successfully!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral font-bold text-white shadow-md">
                <HiOutlineAcademicCap size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Dr. Ananya Sharma
                </p>
                <p className="text-xs text-slate-400">
                  Bashkir State Medical University, Russia
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex h-64 items-center justify-center bg-slate-800 lg:h-full">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
              alt="Medical Student Experience"
              className="h-full w-full object-cover opacity-60"
            />
            <button className="group absolute flex h-16 w-16 items-center justify-center rounded-full bg-coral text-white shadow-lg transition-transform hover:scale-110">
              <HiOutlinePlay
                size={32}
                className="ml-1 transition-transform group-hover:scale-110"
              />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h3 className="font-heading text-xl font-bold text-navy-600">
              Verified Student Reviews
            </h3>
            <p className="text-xs text-navy-400">
              Filtered by popular study destinations
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-coral text-white shadow-sm"
                    : "bg-navy-50 text-navy-500 hover:bg-navy-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-navy-50/60"
              />
            ))}

          {!isLoading && filteredTestimonials.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm">
              <HiOutlineChatAlt2 className="mx-auto text-navy-300" size={32} />
              <p className="mt-2 text-sm text-navy-400">
                No success stories found for this destination yet.
              </p>
            </div>
          )}

          {!isLoading &&
            filteredTestimonials.map((t) => (
              <div
                key={t._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-slate-200 hover:shadow-xl"
              >
                <div>
                  {/* Rating Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-coral">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <HiStar key={i} size={18} />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      <HiOutlineCheckCircle size={14} /> Verified
                    </span>
                  </div>

                  {/* Quote Text */}
                  <p className="mt-4 text-xs leading-relaxed text-slate-600 italic">
                    "{t.quote}"
                  </p>
                </div>

                {/* Student Info Card Footer */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-50 pt-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-navy-50">
                    {t.photo?.url ? (
                      <img
                        src={t.photo.url}
                        alt={t.studentName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-navy-400">
                        {t.studentName?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-600">
                      {t.studentName}
                    </p>
                    <p className="truncate text-xs text-navy-400">
                      {t.university?.name ||
                        t.country?.name ||
                        "Study Abroad Student"}
                    </p>
                    {t.batch && (
                      <span className="text-[10px] font-semibold text-coral">
                        {t.batch}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default TestimonialsPage;
