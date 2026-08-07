import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiChevronDown, HiSparkles } from "react-icons/hi";
import { useCountries } from "../../hooks/useCountries";

// --- BRAND CONSTANTS ---
const ORANGE = "#D94A28";
const NAVY = "#0F2540";

// --- PRELOADER COMPONENT ---
export const Preloader = ({ show }) => {
  const medicoContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const overseasContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 1.2 },
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.18, scale: 1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute h-[28rem] w-[28rem] rounded-full bg-[#D94A28] blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-center sm:space-x-3">
            <div className="flex flex-col items-start font-sans font-bold tracking-tight">
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

              <div className="relative mt-[-6px] flex items-baseline">
                <motion.div
                  variants={overseasContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
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
                <motion.path
                  d="M 62 82 L 63 85 L 66 85 L 64 87 L 65 90 L 62 88 L 59 90 L 60 87 L 58 85 L 61 85 Z M 78 75 L 79 78 L 82 78 L 80 80 L 81 83 L 78 81 L 75 83 L 76 80 L 74 78 L 77 78 Z M 92 88 L 93 91 L 96 91 L 94 93 L 95 96 L 92 94 L 89 96 L 90 93 L 88 91 L 91 91 Z"
                  fill={NAVY}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  transition={{ delay: 2.0, duration: 1.0 }}
                />
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
                <motion.g
                  initial={{ scale: 0, x: -15, y: 15 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  transition={{ delay: 4.0, duration: 0.6, ease: "backOut" }}
                >
                  <path
                    d="M 148 72 L 138 78 L 134 74 L 132 76 L 136 81 L 128 86 L 124 84 L 122 86 L 127 89 L 123 93 L 126 94 L 132 89 L 142 83 L 150 78 C 152 76, 151 73, 148 72 Z"
                    fill={ORANGE}
                  />
                </motion.g>
              </svg>
            </motion.div>
          </div>

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

const EXAM_LINKS = [
  { label: "FMGE Exam", to: "/exams/fmge" },
  { label: "NMAT Exam", to: "/exams/nmat" },
];

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Success Stories", to: "/testimonials" },
];

// --- MAIN NAVBAR COMPONENT ---
const Navbar = () => {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const location = useLocation();
  const { data: countries = [] } = useCountries();

  // Exclude Preloader on admin/auth pages
  const isExcludedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  useEffect(() => {
    if (isExcludedRoute) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => setLoading(false), 5200);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isExcludedRoute, location.pathname]);

  // Hide the public header entirely on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const navLinkClass =
    "text-xs font-bold uppercase tracking-wider transition-all duration-200 text-navy-700 hover:text-coral py-2";

  return (
    <>
      {/* Preloader only runs for non-admin/non-auth routes */}
      {!isExcludedRoute && <Preloader show={loading} />}

      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-100 bg-white/95 backdrop-blur-xl shadow-md py-1"
            : "border-b border-transparent bg-white/90 backdrop-blur-md py-2"
        }`}
      >
        <nav className="section-container flex h-16 items-center justify-between">
          <Link
            to="/"
            aria-label="Medico Overseas home"
            className="flex items-center transition-transform hover:scale-[1.02]"
          >
            <img
              src="/medicologo-removebg-preview.png"
              alt=""
              className="h-9 w-auto max-w-[150px] object-contain shrink"
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `${navLinkClass} ${
                      isActive
                        ? "!text-coral relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-coral"
                        : ""
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}

            {/* Destinations Dropdown (Single Column Vertical List) */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown("destinations")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex items-center gap-1.5 ${navLinkClass} ${
                  location.pathname.includes("/destinations")
                    ? "!text-coral"
                    : ""
                }`}
              >
                <span>Destinations</span>
                <HiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openDropdown === "destinations"
                      ? "rotate-180 text-coral"
                      : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openDropdown === "destinations" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="mb-2 border-b border-slate-100 px-3 pb-2 pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400 flex items-center gap-1">
                        <HiSparkles className="text-coral" size={12} /> Study
                        MBBS Abroad
                      </span>
                      <span className="text-[10px] font-semibold text-coral bg-coral-50 px-2 py-0.5 rounded-full">
                        {countries.length} Places
                      </span>
                    </div>

                    {/* Single Column Vertical Stack */}
                    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto no-scrollbar">
                      {countries.map((c) => (
                        <Link
                          key={c._id}
                          to={`/destinations/mbbs-in-${c.slug}`}
                          className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-navy-700 transition-all hover:bg-coral-50/60 hover:text-coral"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 transition-colors group-hover:bg-coral shrink-0" />
                            <span className="truncate">MBBS in {c.name}</span>
                          </div>
                          <span className="text-[10px] text-coral opacity-0 transition-opacity group-hover:opacity-100 font-bold">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {/* Exams Dropdown (Single Column Vertical List) */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown("exams")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex items-center gap-1.5 ${navLinkClass} ${
                  location.pathname.includes("/exams") ? "!text-coral" : ""
                }`}
              >
                <span>Exams</span>
                <HiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openDropdown === "exams" ? "rotate-180 text-coral" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openDropdown === "exams" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="mb-2 border-b border-slate-100 px-3 pb-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">
                        Medical Licensing
                      </span>
                    </div>

                    {/* Single Column Vertical Stack */}
                    <div className="flex flex-col gap-1">
                      {EXAM_LINKS.map((e) => (
                        <Link
                          key={e.to}
                          to={e.to}
                          className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-navy-700 transition-all hover:bg-coral-50/60 hover:text-coral"
                        >
                          <span>{e.label}</span>
                          <span className="text-[10px] font-bold text-coral opacity-0 transition-opacity group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            <li>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `${navLinkClass} ${
                    isActive
                      ? "!text-coral relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-coral"
                      : ""
                  }`
                }
              >
                Blogs
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `${navLinkClass} ${
                    isActive
                      ? "!text-coral relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-coral"
                      : ""
                  }`
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-navy-700 transition-all hover:border-coral hover:bg-coral-50/40 hover:text-coral"
            >
              Portal Login
            </Link>

            <Link
              to="/contact#enquiry"
              className="rounded-xl bg-coral px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
            >
              Get Free Counselling
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="rounded-xl p-2 text-navy-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ x: "100vw" }}
              animate={{ x: 0 }}
              exit={{ x: "100vw" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-0 w-screen h-screen z-[60] flex flex-col bg-white p-6 overflow-y-auto lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <img
                  src="/medicologo-removebg-preview.png"
                  alt="Medico Overseas Logo"
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-2 text-navy-700 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <HiX size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto pr-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-navy-700 hover:bg-coral-50/50 hover:text-coral"
                  >
                    {link.label}
                  </Link>
                ))}

                <MobileAccordion title="Destinations">
                  {countries.map((c) => (
                    <Link
                      key={c._id}
                      to={`/destinations/mbbs-in-${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-coral-50/50 hover:text-coral"
                    >
                      MBBS in {c.name}
                    </Link>
                  ))}
                </MobileAccordion>

                <MobileAccordion title="Exams">
                  {EXAM_LINKS.map((e) => (
                    <Link
                      key={e.to}
                      to={e.to}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-coral-50/50 hover:text-coral"
                    >
                      {e.label}
                    </Link>
                  ))}
                </MobileAccordion>

                <Link
                  to="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-navy-700 hover:bg-coral-50/50 hover:text-coral"
                >
                  Blogs
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-navy-700 hover:bg-coral-50/50 hover:text-coral"
                >
                  Contact
                </Link>
              </div>

              <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl border border-slate-200 py-3 text-center text-xs font-bold text-navy-700"
                >
                  Portal Login
                </Link>
                <Link
                  to="/contact#enquiry"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl bg-coral py-3 text-center text-xs font-bold text-white shadow-md"
                >
                  Get Free Counselling
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

const MobileAccordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-navy-700 hover:bg-coral-50/50"
      >
        <span>{title}</span>
        <HiChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180 text-coral" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
