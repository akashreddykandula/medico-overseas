import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ show }) => {
  const ORANGE = "#C8401A";
  const NAVY = "#0B2240";

  const medicoContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const overseasContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.0,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
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
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white selection:bg-transparent"
          role="status"
          aria-label="Loading Medico Overseas"
          aria-live="polite"
        >
          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center sm:space-x-4">
            <div className="flex flex-col items-start font-sans font-bold tracking-tight">
              <motion.div
                variants={medicoContainer}
                initial="hidden"
                animate="visible"
                className="flex text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
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

              <div className="relative mt-[-4px] flex items-baseline">
                <motion.div
                  variants={overseasContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                  style={{ color: NAVY }}
                >
                  {overseasBeforeV.map((char, index) => (
                    <motion.span
                      key={`ov-1-${index}`}
                      variants={letterVariants}
                    >
                      {char}
                    </motion.span>
                  ))}

                  <motion.div
                    variants={letterVariants}
                    className="relative mx-[1px] inline-block"
                  >
                    <svg
                      className="inline-block h-[1.35em] w-[1.15em] overflow-visible align-baseline"
                      viewBox="0 0 220 120"
                      fill="none"
                      aria-hidden="true"
                    >
                      <motion.path
                        d="M 15 25 Q 30 55 50 68 Q 70 55 85 25"
                        stroke={NAVY}
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 1,
                          delay: 1.5,
                          ease: "easeInOut",
                        }}
                      />

                      <motion.path
                        d="M 50 68 C 50 92, 70 112, 110 112 C 150 112, 180 98, 210 108"
                        stroke={NAVY}
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 1.5,
                          delay: 2.2,
                          ease: "easeInOut",
                        }}
                      />

                      <motion.circle
                        cx="212"
                        cy="108"
                        r="9"
                        fill={NAVY}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 3.6,
                          duration: 0.3,
                        }}
                      />

                      <motion.circle
                        cx="212"
                        cy="108"
                        r="4"
                        fill="#FFFFFF"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 3.7,
                          duration: 0.2,
                        }}
                      />
                    </svg>
                  </motion.div>

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

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 sm:ml-2 sm:mt-0"
            >
              <svg
                viewBox="0 0 160 160"
                className="h-32 w-32 sm:h-40 sm:w-40 lg:h-44 lg:w-44"
                aria-hidden="true"
              >
                <motion.circle
                  cx="80"
                  cy="95"
                  r="36"
                  stroke={ORANGE}
                  strokeWidth="5.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    delay: 0.6,
                  }}
                />

                <motion.path
                  d="M 62 82 L 63 85 L 66 85 L 64 87 L 65 90 L 62 88 L 59 90 L 60 87 L 58 85 L 61 85 Z
                     M 78 75 L 79 78 L 82 78 L 80 80 L 81 83 L 78 81 L 75 83 L 76 80 L 74 78 L 77 78 Z
                     M 92 88 L 93 91 L 96 91 L 94 93 L 95 96 L 92 94 L 89 96 L 90 93 L 88 91 L 91 91 Z"
                  fill={NAVY}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{
                    delay: 1.8,
                    duration: 0.8,
                  }}
                />

                <motion.path
                  d="M 80 20 L 140 46 L 80 72 L 20 46 Z"
                  fill={NAVY}
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.8,
                    ease: "easeOut",
                  }}
                />

                <motion.path
                  d="M 40 55 V 78 C 40 88, 55 98, 80 98 C 105 98, 120 88, 120 78 V 55"
                  fill={NAVY}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 1.2,
                    duration: 0.6,
                  }}
                />

                <motion.path
                  d="M 38 48 V 75 M 36 75 H 40"
                  stroke={ORANGE}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    delay: 1.5,
                    duration: 0.6,
                  }}
                />

                <motion.path
                  d="M 35 125 C 50 145, 110 135, 132 80"
                  stroke={ORANGE}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.8,
                    delay: 1.8,
                    ease: "easeInOut",
                  }}
                />

                <motion.g
                  initial={{ scale: 0, x: -10, y: 10 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  transition={{
                    delay: 3.2,
                    duration: 0.5,
                    ease: "backOut",
                  }}
                >
                  <path
                    d="M 148 72 L 138 78 L 134 74 L 132 76 L 136 81 L 128 86 L 124 84 L 122 86 L 127 89 L 123 93 L 126 94 L 132 89 L 142 83 L 150 78 C 152 76, 151 73, 148 72 Z"
                    fill={ORANGE}
                  />
                </motion.g>
              </svg>
            </motion.div>
          </div>

          <div
            className="absolute bottom-10 h-[3px] w-36 overflow-hidden rounded-full bg-slate-100"
            aria-hidden="true"
          >
            <motion.div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: ORANGE }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
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
