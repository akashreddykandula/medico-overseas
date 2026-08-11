import React from "react";
import { motion } from "framer-motion";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=2400&auto=format&fit=crop";

const PageHero = ({
  eyebrow,
  title,
  subtitle,
  transparent = false,
  backgroundImage = DEFAULT_HERO_IMAGE,
}) => (
  <section
    className={`relative overflow-hidden text-white ${
      transparent
        ? "bg-transparent"
        : "min-h-[320px] bg-[#071A38] sm:min-h-[360px] lg:min-h-[400px]"
    }`}
  >
    {/* Background Image */}
    {!transparent && (
      <>
        <motion.img
          src={backgroundImage}
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 5, ease: "easeOut" },
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-[#071A38]/50" aria-hidden="true" />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#071A38]/85 via-[#102F5C]/60 to-[#071A38]/70"
          aria-hidden="true"
        />

        {/* Bottom Gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#071A38]/80 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Ambient Coral Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/10 blur-3xl sm:h-96 sm:w-96"
          aria-hidden="true"
        />
      </>
    )}

    {/* Existing Mesh Background for transparent mode */}
    {/* {transparent && (
      <div
        className="pointer-events-none absolute inset-0 bg-mesh-navy opacity-70"
        aria-hidden="true"
      />
    )} */}

    {/* Content */}
    <div
      className={`section-container relative z-10 text-center ${
        transparent
          ? "py-10 sm:py-14"
          : "flex min-h-[320px] items-center justify-center py-16 sm:min-h-[360px] lg:min-h-[400px]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        {/* Eyebrow */}
        {eyebrow && (
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-coral backdrop-blur-md">
            {eyebrow}
          </span>
        )}

        {/* Title */}
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  </section>
);

export default PageHero;
