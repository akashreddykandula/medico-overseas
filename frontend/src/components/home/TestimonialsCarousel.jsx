import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  HiStar,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import "swiper/css";
import "swiper/css/pagination";
import { useTestimonials } from "../../hooks/useContent";
import EnquiryForm from "./forms/EnquiryForm";

const TestimonialsCarousel = () => {
  const { data, isLoading } = useTestimonials({
    isFeaturedOnHomepage: true,
  });

  const demoTestimonials = [
    {
      _id: "1",
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
      _id: "2",
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
      _id: "3",
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
      _id: "4",
      studentName: "Dr. Ananya Patel",
      rating: 5,
      quote:
        "Clear guidance on FMGE/NEXT exam syllabus right from 1st year. The visa processing and university documentation was handled flawlessly.",
      photo: {
        url: "https://images.unsplash.com/photo-1594824813571-24a69c100d02?w=400",
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
      _id: "5",
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
      _id: "6",
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

  const testimonials = data && data.length > 0 ? data : demoTestimonials;

  if (isLoading) {
    return (
      <section className="bg-navy py-24">
        <div className="section-container text-center text-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-coral border-t-transparent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              Loading student reviews...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-navy py-24">
      {/* Background Soft Glow Accents */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-navy-400/20 blur-3xl" />

      <div className="section-container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral backdrop-blur-md">
            <HiOutlineAcademicCap size={16} /> Student Success Stories
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mt-4 leading-relaxed text-navy-200">
            Real journeys from students now studying — or already practicing —
            after going abroad with us.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="mt-14">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            speed={5000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3.5 },
            }}
            pagination={{ clickable: true }}
            className="marquee-swiper pb-16"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t._id} className="h-auto">
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-coral/40 hover:bg-white/15 hover:shadow-2xl">
                  <div>
                    {/* Rating Stars & Verified Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-coral">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <HiStar key={i} size={18} />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        <HiOutlineCheckCircle size={12} /> Verified
                      </span>
                    </div>

                    {/* Quote */}
                    <p className="mt-4 text-xs leading-relaxed text-navy-100 italic">
                      "{t.quote}"
                    </p>
                  </div>

                  {/* Student Profile Info */}
                  <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                    <div
                      className="h-11 w-11 shrink-0 rounded-full border border-white/20 bg-navy-400 bg-cover bg-center shadow-md transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${t.photo?.url || ""})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white text-sm">
                        {t.studentName}
                      </p>
                      <p className="truncate text-xs text-navy-300">
                        {t.university?.name ||
                          t.country?.name ||
                          "Medical Student"}
                      </p>
                      {t.batch && (
                        <p className="text-[10px] font-medium text-coral">
                          {t.batch}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* CSS Override for Linear Marquee Transition */}
      <style>{`
        .marquee-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        .marquee-swiper .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.3;
        }
        .marquee-swiper .swiper-pagination-bullet-active {
          background: #E15B3F !important;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsCarousel;
