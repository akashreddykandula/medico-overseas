import React from 'react';
import { motion } from 'framer-motion';

const PageHero = ({ eyebrow, title, subtitle }) => (
  <section className="relative overflow-hidden bg-navy pb-16 pt-32">
    <div className="absolute inset-0 bg-mesh-navy opacity-70" />
    <div className="section-container relative text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {eyebrow && (
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-navy-100">{subtitle}</p>}
      </motion.div>
    </div>
  </section>
);

export default PageHero;
