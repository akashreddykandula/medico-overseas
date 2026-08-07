import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ show }) => {
  // Brand Colors matching image precisely
  const ORANGE = "#D94A28";
  const NAVY = "#0F2540";

  // Stagger delays for slow letter-by-letter sequence
  const medicoContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const overseasContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 1.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const medicoText = "Medico".split("");
  const overseasBeforeV = "O".split("");
  const overseasAfterV = "erseas".split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F9FBFD] selection:bg-none"
        >
          {/* Subtle Ambient Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.18, scale: 1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute h-[28rem] w-[28rem] rounded-full bg-[#D94A28] blur-3xl pointer-events-none"
          />

          {/* Logo Content Container */}
          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center sm:space-x-3">
            {/* Left Column: Animated Text */}
            <div className="flex flex-col items-start font-sans font-bold tracking-tight">
              {/* "Medico" */}
              <motion.div
                variants={medicoContainer}
                initial="hidden"
                animate="visible"
                className="flex text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                style={{ color: ORANGE }}
              >
                {medicoText.map((char, index) => (
                  <motion.span
                    key={`medico-${index}`}
                    variants={letterVariants}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {/* "Overseas" with Integrated Stethoscope 'V' */}
              <div className="relative mt-[-6px] flex items-baseline">
                <motion.div
                  variants={overseasContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                  style={{ color: NAVY }}
                >
                  {/* Letter "O" */}
                  {overseasBeforeV.map((char, index) => (
                    <motion.span
                      key={`ov-1-${index}`}
                      variants={letterVariants}
                    >
                      {char}
                    </motion.span>
                  ))}

                  {/* Animated Stethoscope replacing 'v' */}
                  <motion.div
                    variants={letterVariants}
                    className="relative inline-block mx-[1px]"
                  >
                    <svg
                      className="w-[1.1em] h-[1.3em] overflow-visible inline-block align-baseline"
                      viewBox="0 0 100 120"
                      fill="none"
                    >
                      <motion.path
                        d="M 15 20 Q 30 50 50 65 Q 70 50 85 20"
                        stroke={NAVY}
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 1.2,
                          delay: 1.8,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.path
                        d="M 50 65 C 50 90, 70 110, 110 110 C 150 110, 180 95, 210 105"
                        stroke={NAVY}
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 1.8,
                          delay: 2.6,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.circle
                        cx="212"
                        cy="105"
                        r="10"
                        fill={NAVY}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 4.2, duration: 0.4 }}
                      />
                      <motion.circle
                        cx="212"
                        cy="105"
                        r="5"
                        fill="#F9FBFD"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 4.3, duration: 0.3 }}
                      />
                    </svg>
                  </motion.div>

                  {/* Letters "erseas" */}
                  {overseasAfterV.map((char, index) => (
                    <motion.span
                      key={`ov-2-${index}`}
                      variants={letterVariants}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right Column: Graduation Cap, Globe & Corrected Plane Emblem */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                duration: 1.6,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 sm:mt-0 sm:ml-2"
            >
              <svg
                viewBox="0 0 160 160"
                className="h-32 w-32 sm:h-40 sm:w-40 lg:h-44 lg:w-44"
              >
                {/* Globe Circle Background */}
                <motion.circle
                  cx="80"
                  cy="95"
                  r="36"
                  stroke={ORANGE}
                  strokeWidth="6"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, delay: 0.8 }}
                />

                {/* Stars pattern on globe */}
                <motion.path
                  d="M 62 82 L 63 85 L 66 85 L 64 87 L 65 90 L 62 88 L 59 90 L 60 87 L 58 85 L 61 85 Z
                     M 78 75 L 79 78 L 82 78 L 80 80 L 81 83 L 78 81 L 75 83 L 76 80 L 74 78 L 77 78 Z
                     M 92 88 L 93 91 L 96 91 L 94 93 L 95 96 L 92 94 L 89 96 L 90 93 L 88 91 L 91 91 Z"
                  fill={NAVY}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 2.0, duration: 1.0 }}
                />

                {/* Graduation Cap */}
                <motion.path
                  d="M 80 20 L 140 46 L 80 72 L 20 46 Z"
                  fill={NAVY}
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.1, delay: 1.0, ease: "easeOut" }}
                />
                <motion.path
                  d="M 40 55 V 78 C 40 88, 55 98, 80 98 C 105 98, 120 88, 120 78 V 55"
                  fill={NAVY}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                />
                <motion.path
                  d="M 38 48 V 75 M 36 75 H 40"
                  stroke={ORANGE}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                />

                {/* Flight Orbit Arc */}
                <motion.path
                  d="M 35 125 C 50 145, 110 135, 132 80"
                  stroke={ORANGE}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.0, delay: 2.2, ease: "easeInOut" }}
                />

                {/* --- CORRECTED AIRPLANE ICON SECTION --- */}
                {/* Rebuilt geometry: Rear three-quarter view, climbing up-right */}
                <motion.g
                  initial={{ scale: 0, x: -15, y: 15 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  transition={{ delay: 4.0, duration: 0.6, ease: "backOut" }}
                >
                  {/* Fuselage & Vertical Stabilizer (Climbing Profile) */}
                  <path
                    d="M 124 81 L 138 78 C 145 76 150 78 150 78 L 134 85 L 124 81 Z
                       M 124 81 L 126 71 L 131 77 L 124 81 Z"
                    fill={ORANGE}
                  />
                  {/* Port (Left) Wing - Main Lift Surface, Rear View */}
                  <path
                    d="M 132 82 L 140 80 L 128 88 C 124 90 120 87 120 87 L 132 82 Z"
                    fill={ORANGE}
                  />
                  {/* Starboard (Right) Wing - Partially Hidden, Rear View */}
                  <path
                    d="M 138 78 L 144 76 L 148 78 L 143 81 Z"
                    fill={ORANGE}
                  />
                </motion.g>
                {/* ------------------------------------------ */}
              </svg>
            </motion.div>
          </div>

          {/* Luxury Bottom Progress Bar */}
          <div className="absolute bottom-12 h-[3px] w-40 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: ORANGE }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 2.6,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Preloader;
