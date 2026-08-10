import React from "react";
import { motion } from "framer-motion";

const PageHero = ({ eyebrow, title, subtitle, transparent = false }) => (
  <section
    className={`relative overflow-hidden ${
      transparent ? "bg-transparent" : "bg-navy pb-16 pt-32"
    }`}
  >
    {!transparent && (
      <div
        className="pointer-events-none absolute inset-0 bg-mesh-navy opacity-70"
        aria-hidden="true"
      />
    )}

    <div
      className={`section-container relative text-center ${
        transparent ? "py-10 sm:py-14" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {eyebrow && (
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200">
            {eyebrow}
          </span>
        )}

        <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">{subtitle}</p>
        )}
      </motion.div>
    </div>
  </section>
);

export default PageHero;
