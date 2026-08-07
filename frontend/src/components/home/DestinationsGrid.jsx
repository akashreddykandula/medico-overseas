import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
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
    // Check if uploaded or specified via backend
    if (country.heroImage?.url) return country.heroImage.url;
    if (typeof country.heroImage === "string" && country.heroImage.trim())
      return country.heroImage;
    if (country.coverImage) return country.coverImage;

    // Slug-based fallback or general placeholder
    const slugKey = country.slug?.toLowerCase();
    return FALLBACK_IMAGES[slugKey] || DEFAULT_IMAGE;
  };

  return (
    <section className="bg-navy-50 py-24">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Explore Our Study Destinations</h2>
          <p className="mt-4 text-navy-400">
            Six carefully vetted countries, each offering NMC/WHO-recognized
            universities suited to different budgets and priorities.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-navy-100"
              />
            ))}

          {!isLoading &&
            countries.map((country, i) => {
              const bgUrl = getCountryImage(country);

              return (
                <motion.div
                  key={country._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative h-64 overflow-hidden rounded-2xl bg-navy shadow-glow"
                >
                  {/* Background Image with Fallback handling */}
                  <img
                    src={bgUrl}
                    alt={country.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-heading text-xl font-bold text-white">
                      MBBS in {country.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-200">
                      {country.shortDescription}
                    </p>
                    <Link
                      to={`/destinations/mbbs-in-${country.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-coral transition-all group-hover:translate-x-1"
                    >
                      Learn More <HiArrowRight />
                    </Link>
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
