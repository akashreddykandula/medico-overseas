import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight, HiSparkles } from "react-icons/hi";
import { useCountries } from "../../hooks/useCountries";

const FALLBACK_IMAGES = {
  armenia: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=800",
  georgia: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800",
  russia: "https://images.unsplash.com/photo-1513326718677-b964603b136d?w=800",
  uzbekistan:
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800",
  kyrgyzstan:
    "https://images.unsplash.com/photo-1569531964372-0a67e1039803?w=800",
  kazakhstan: "https://images.unsplash.com/photo-1558588942-930faae5a389?w=800",
  vietnam: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800";

const DestinationsGrid = () => {
  const { data: countries = [], isLoading } = useCountries();

  const getCountryImage = (country) => {
    if (country?.heroImage?.url) return country.heroImage.url;

    if (typeof country?.heroImage === "string" && country.heroImage.trim()) {
      return country.heroImage.trim();
    }

    if (typeof country?.coverImage === "string" && country.coverImage.trim()) {
      return country.coverImage.trim();
    }

    const slugKey =
      typeof country?.slug === "string"
        ? country.slug.toLowerCase().trim()
        : "";

    return FALLBACK_IMAGES[slugKey] || DEFAULT_IMAGE;
  };

  const safeCountries = Array.isArray(countries) ? countries : [];

  return (
    <section className="relative overflow-hidden bg-[#071A38] py-16 sm:py-24 text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute right-5 sm:right-10 top-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="section-container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold tracking-wider text-coral uppercase backdrop-blur-md">
            <HiSparkles size={14} /> Global Opportunities
          </span>
          <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Explore Our Study Destinations
          </h2>
          <p className="mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed text-slate-300">
            Handpicked medical destinations offering NMC/WHO-recognized
            universities suited to different budgets and ambitions.
          </p>
        </motion.div>

        {/* Destination Cards Grid */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`destination-skeleton-${index}`}
                className="h-72 sm:h-80 animate-pulse rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10"
                aria-hidden="true"
              />
            ))}

          {!isLoading &&
            safeCountries.map((country, index) => {
              if (!country?._id || !country?.slug) return null;

              const bgUrl = getCountryImage(country);
              const duration = Number(country?.durationYears) || 6;

              return (
                <motion.div
                  key={country._id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="group relative h-72 sm:h-80 overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-1 backdrop-blur-xl shadow-2xl transition-transform transition-shadow duration-300 ease-out hover:border-coral/50 hover:shadow-coral/20 hover:-translate-y-2"
                >
                  {/* Clean Light Sweep Overlay on Hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-coral/20 via-transparent to-sky-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Inner Card Container matching #071A38 theme */}
                  <div className="relative h-full w-full overflow-hidden rounded-[18px] sm:rounded-[22px] bg-[#071A38]">
                    {/* Background Image */}
                    <img
                      src={bgUrl}
                      alt={
                        country.name
                          ? `MBBS in ${country.name}`
                          : "Study destination"
                      }
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(event) => {
                        if (event.currentTarget.src !== DEFAULT_IMAGE) {
                          event.currentTarget.src = DEFAULT_IMAGE;
                        }
                      }}
                    />

                    {/* Multi-tier Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071A38] via-[#071A38]/60 to-transparent transition-opacity duration-500 group-hover:via-[#071A38]/70" />

                    {/* Top Badge */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                      <span className="rounded-full bg-black/40 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-white backdrop-blur-md border border-white/10 tracking-wider uppercase">
                        NMC Approved
                      </span>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 flex flex-col justify-end">
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-white transition-colors duration-300 group-hover:text-coral">
                        MBBS in {country.name || "Destination"}
                      </h3>

                      {country.shortDescription && (
                        <p className="mt-1.5 sm:mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300 transition-colors duration-300 group-hover:text-white">
                          {country.shortDescription}
                        </p>
                      )}

                      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between">
                        <Link
                          to={`/destinations/mbbs-in-${encodeURIComponent(
                            country.slug,
                          )}`}
                          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-coral transition-all duration-300 group-hover:gap-3 group-hover:text-white"
                          aria-label={`Learn more about MBBS in ${
                            country.name || "this destination"
                          }`}
                        >
                          Explore Programs
                          <HiArrowRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </Link>

                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                          {duration} Years Course
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default DestinationsGrid;
