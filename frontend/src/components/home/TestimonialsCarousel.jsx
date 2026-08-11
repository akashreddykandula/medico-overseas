import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  HiStar,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiSparkles,
} from "react-icons/hi";
import "swiper/css";
import "swiper/css/pagination";
import { useTestimonials } from "../../hooks/useContent";

const DEFAULT_PHOTO = "";

const isSafeImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getSafeImageUrl = (value) =>
  isSafeImageUrl(value) ? value : DEFAULT_PHOTO;

const getSafeRating = (rating) => {
  const parsed = Number(rating);

  if (!Number.isFinite(parsed)) return 5;

  return Math.min(5, Math.max(1, Math.floor(parsed)));
};

const demoTestimonials = [
  {
    _id: "demo-1",
    studentName: "Rahul Sharma",
    rating: 5,
    quote:
      "Medico Overseas made my MBBS admission process completely stress-free. Their counsellors guided me from university selection to visa approval.",
    photo: {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    },
    country: {
      name: "Russia",
    },
    university: {
      name: "Kazan Federal University",
    },
    batch: "Batch of 2022",
  },
  {
    _id: "demo-2",
    studentName: "Priya Reddy",
    rating: 5,
    quote:
      "I was worried about studying abroad, but the team answered every question. Today I'm happily pursuing MBBS in Georgia with Indian food mess facilities.",
    photo: {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    country: {
      name: "Georgia",
    },
    university: {
      name: "Tbilisi State Medical University",
    },
    batch: "Batch of 2023",
  },
  {
    _id: "demo-3",
    studentName: "Aditya Verma",
    rating: 5,
    quote:
      "Excellent support from documentation to airport departure. I highly recommend Medico Overseas to every NEET-qualified student aiming for abroad.",
    photo: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    country: {
      name: "Kyrgyzstan",
    },
    university: {
      name: "Osh State University",
    },
    batch: "Batch of 2021",
  },
  {
    _id: "demo-4",
    studentName: "Dr. Ananya Patel",
    rating: 5,
    quote:
      "Clear guidance on FMGE/NEXT exam syllabus right from 1st year. The visa processing and university documentation was handled flawlessly.",
    photo: {
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    country: {
      name: "Kazakhstan",
    },
    university: {
      name: "Kazakh National Medical University",
    },
    batch: "Batch of 2020",
  },
  {
    _id: "demo-5",
    studentName: "Vikramaditya Rao",
    rating: 5,
    quote:
      "Hostel allotment, airport pickup, and local city registration were all pre-arranged by Medico Overseas before our flight even landed.",
    photo: {
      url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    },
    country: {
      name: "Uzbekistan",
    },
    university: {
      name: "Samarkand State Medical University",
    },
    batch: "Batch of 2023",
  },
  {
    _id: "demo-6",
    studentName: "Sneha Mukherjee",
    rating: 5,
    quote:
      "Honest fee structure details with no hidden expenses. Their counselors guided my parents through every bank document required.",
    photo: {
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    },
    country: {
      name: "Russia",
    },
    university: {
      name: "Bashkir State Medical University",
    },
    batch: "Batch of 2022",
  },
];

const TestimonialsCarousel = () => {
  const { data, isLoading } = useTestimonials({
    isFeaturedOnHomepage: true,
  });

  const testimonials =
    Array.isArray(data) && data.length > 0 ? data : demoTestimonials;

  if (isLoading) {
    return (
      <section className="bg-white py-16 sm:py-24 text-navy-600">
        <div className="section-container">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto h-6 w-32 animate-pulse rounded-full bg-navy-100" />
            <div className="mx-auto mt-3 h-8 w-64 animate-pulse rounded-lg bg-navy-100" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-navy-100 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-1/2 rounded bg-navy-100" />
                    <div className="h-3 w-1/3 rounded bg-navy-50" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full rounded bg-navy-50" />
                  <div className="h-3 w-5/6 rounded bg-navy-50" />
                  <div className="h-3 w-4/6 rounded bg-navy-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white py-16 sm:py-24 text-navy-600">
      {/* Premium Ambient Background Backlights */}
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-coral/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-sky-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="section-container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-100 bg-coral-50/80 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-coral shadow-2xs backdrop-blur-md">
            <HiSparkles size={14} aria-hidden="true" />
            Student Success Stories
          </span>

          <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-navy-700 tracking-tight">
            What Our Students Say
          </h2>

          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-slate-600">
            Real journeys from students now studying — or already practicing —
            after going abroad with us.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="mt-10 sm:mt-16">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            loop={testimonials.length > 1}
            speed={4000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              520: { slidesPerView: 1.2, spaceBetween: 18 },
              640: { slidesPerView: 1.6, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 3.5, spaceBetween: 28 },
            }}
            pagination={{ clickable: true }}
            className="marquee-swiper pb-14 sm:pb-16"
          >
            {testimonials.map((t, index) => {
              const rating = getSafeRating(t?.rating);
              const photoUrl = getSafeImageUrl(t?.photo?.url);

              return (
                <SwiperSlide
                  key={t?._id || `testimonial-${index}`}
                  className="h-auto"
                >
                  <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-7 text-navy-600 backdrop-blur-xl shadow-md sm:shadow-lg shadow-slate-100/70 transition-all duration-300 hover:-translate-y-1.5 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/10">
                    {/* Decorative Corner Watermark */}
                    <div className="pointer-events-none absolute -right-3 -top-3 sm:-right-4 sm:-top-4 text-slate-100/80 transition-colors duration-300 group-hover:text-coral/10">
                      <HiOutlineAcademicCap className="w-20 h-20 sm:w-28 sm:h-28" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex gap-0.5 sm:gap-1 text-amber-400"
                          aria-label={`${rating} out of 5 stars`}
                        >
                          {Array.from({ length: rating }).map((_, i) => (
                            <HiStar
                              key={i}
                              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                              aria-hidden="true"
                            />
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-600 shadow-2xs shrink-0">
                          <HiOutlineCheckCircle size={12} aria-hidden="true" />
                          Verified
                        </span>
                      </div>

                      <p className="mt-3.5 sm:mt-5 text-xs sm:text-sm italic leading-relaxed text-slate-600">
                        &quot;{t?.quote || ""}&quot;
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 sm:mt-6 flex items-center gap-3 sm:gap-3.5 border-t border-slate-100 pt-3.5 sm:pt-5">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full border-2 border-white bg-slate-100 object-cover shadow-xs ring-2 ring-slate-100 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full border-2 border-white bg-slate-100 shadow-xs ring-2 ring-slate-100"
                          aria-hidden="true"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-navy-700 transition-colors duration-300 group-hover:text-coral">
                          {t?.studentName || "Medical Student"}
                        </p>

                        <p className="truncate text-[11px] sm:text-xs font-medium text-slate-500">
                          {t?.university?.name ||
                            t?.country?.name ||
                            "Medical Student"}
                        </p>

                        {t?.batch && (
                          <p className="mt-0.5 text-[9px] sm:text-[10px] font-bold text-coral">
                            {t.batch}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style>{`
        .marquee-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }

        .marquee-swiper .swiper-pagination-bullet {
          background: #0f172a;
          opacity: 0.15;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }

        .marquee-swiper .swiper-pagination-bullet-active {
          background: #e15b3f !important;
          opacity: 1;
          width: 22px;
          border-radius: 9999px;
        }

        @media (max-width: 640px) {
          .marquee-swiper {
            padding-bottom: 3.5rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsCarousel;
