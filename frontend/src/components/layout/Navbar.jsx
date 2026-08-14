import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMenu,
  HiX,
  HiChevronDown,
  HiSparkles,
  HiArrowRight,
} from "react-icons/hi";
import { useCountries } from "../../hooks/useCountries";

// --- BRAND CONSTANTS ---
const ORANGE = "#E15B3F";
const NAVY = "#1F3864";

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
const Navbar = ({ onMobileMenuChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // States to track active hover position for the magnetic dynamic bubble
  const [hoveredRect, setHoveredRect] = useState(null);
  const navContainerRef = useRef(null);

  const location = useLocation();
  const { data: countries = [] } = useCountries();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- LOCK BACKGROUND SCROLL ON MOBILE MENU OPEN ---
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // Recalculate dynamic pill positions
  const handleMouseEnterItem = (e) => {
    if (!navContainerRef.current) return;
    const itemRect = e.currentTarget.getBoundingClientRect();
    const containerRect = navContainerRef.current.getBoundingClientRect();

    setHoveredRect({
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
      height: itemRect.height,
      top: itemRect.top - containerRect.top,
    });
  };

  const handleMouseLeaveNav = () => {
    setHoveredRect(null);
  };

  // Hide header on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const baseNavLinkClass =
    "relative z-10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 text-slate-700 hover:text-[#E15B3F] flex items-center gap-1.5 cursor-pointer select-none";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "py-2.5" : "py-4"
      }`}
    >
      <div className="section-container mx-auto px-1 lg:px-4">
        <nav
          className={`flex h-14 items-center justify-between rounded-full border px-4 lg:px-6 transition-all duration-500 ${
            scrolled
              ? "border-slate-100/80 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
              : "border-slate-200/50 bg-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] backdrop-blur-xl"
          }`}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            aria-label="Medico Overseas home"
            className="group relative flex items-center transition-transform duration-300 hover:scale-[1.02]"
          >
            <img
              src="/medicologo-removebg-preview.png"
              alt="Medico OverSeas Logo"
              className="h-9 w-auto max-w-[170px] shrink object-contain transition-opacity duration-300 group-hover:opacity-90"
            />
          </Link>

          {/* Desktop Nav Links with Magnetic Dynamic Pill */}
          <div
            ref={navContainerRef}
            onMouseLeave={handleMouseLeaveNav}
            className="relative hidden items-center lg:flex"
          >
            {/* Animated Dynamic Morphing Bubble */}
            <AnimatePresence>
              {hoveredRect && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: hoveredRect.left,
                    width: hoveredRect.width,
                    height: hoveredRect.height,
                    top: hoveredRect.top,
                  }}
                  animate={{
                    opacity: 1,
                    x: hoveredRect.left,
                    width: hoveredRect.width,
                    height: hoveredRect.height,
                    top: hoveredRect.top,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                    mass: 0.6,
                  }}
                  className="pointer-events-none absolute rounded-full bg-gradient-to-r from-[#E15B3F]/10 via-[#E15B3F]/15 to-[#E15B3F]/10 border border-[#E15B3F]/20 shadow-[0_2px_10px_rgba(225,91,63,0.08)] backdrop-blur-md"
                />
              )}
            </AnimatePresence>

            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li
                  key={link.to}
                  onMouseEnter={handleMouseEnterItem}
                  className="relative"
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `${baseNavLinkClass} ${isActive ? "!text-[#E15B3F]" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{link.label}</span>
                        {isActive && (
                          <motion.span
                            layoutId="activeDot"
                            className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E15B3F] shadow-[0_0_8px_#E15B3F]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}

              {/* Destinations Dropdown */}
              <li
                className="relative"
                onMouseEnter={(e) => {
                  handleMouseEnterItem(e);
                  setOpenDropdown("destinations");
                }}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`${baseNavLinkClass} ${
                    location.pathname.includes("/destinations")
                      ? "!text-[#E15B3F]"
                      : ""
                  }`}
                >
                  <span>Destinations</span>
                  <HiChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      openDropdown === "destinations"
                        ? "rotate-180 text-[#E15B3F]"
                        : "opacity-70"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === "destinations" && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.94 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                      }}
                      className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
                    >
                      <div className="mb-2 flex items-center justify-between border-b border-slate-100/80 px-3 pb-2.5 pt-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          <HiSparkles className="text-[#E15B3F]" size={13} />
                          Study MBBS Abroad
                        </span>
                        <span className="rounded-full bg-[#E15B3F]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#E15B3F]">
                          {countries.length} Places
                        </span>
                      </div>

                      <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {countries.map((c) => (
                          <Link
                            key={c._id}
                            to={`/destinations/mbbs-in-${c.slug}`}
                            className="group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 transition-all duration-300 group-hover:scale-125 group-hover:bg-[#E15B3F]" />
                              <span className="truncate">MBBS in {c.name}</span>
                            </div>
                            <HiArrowRight className="text-[12px] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-[#E15B3F]" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              {/* Exams Dropdown */}
              <li
                className="relative"
                onMouseEnter={(e) => {
                  handleMouseEnterItem(e);
                  setOpenDropdown("exams");
                }}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`${baseNavLinkClass} ${
                    location.pathname.includes("/exams")
                      ? "!text-[#E15B3F]"
                      : ""
                  }`}
                >
                  <span>Exams</span>
                  <HiChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      openDropdown === "exams"
                        ? "rotate-180 text-[#E15B3F]"
                        : "opacity-70"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === "exams" && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.94 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                      }}
                      className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
                    >
                      <div className="mb-2 border-b border-slate-100/80 px-3 pb-2.5 pt-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Medical Licensing
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        {EXAM_LINKS.map((e) => (
                          <Link
                            key={e.to}
                            to={e.to}
                            className="group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
                          >
                            <span>{e.label}</span>
                            <HiArrowRight className="text-[12px] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-[#E15B3F]" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              <li onMouseEnter={handleMouseEnterItem} className="relative">
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    `${baseNavLinkClass} ${isActive ? "!text-[#E15B3F]" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>Blogs</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeDot"
                          className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E15B3F] shadow-[0_0_8px_#E15B3F]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>

              <li onMouseEnter={handleMouseEnterItem} className="relative">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `${baseNavLinkClass} ${isActive ? "!text-[#E15B3F]" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>Contact</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeDot"
                          className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E15B3F] shadow-[0_0_8px_#E15B3F]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="rounded-full border border-slate-200/80 bg-white/50 px-4 py-2 text-xs font-bold text-slate-700 transition-all duration-300 hover:border-[#E15B3F]/40 hover:bg-[#E15B3F]/5 hover:text-[#E15B3F] active:scale-95"
            >
              Portal Login
            </Link>

            <Link
              to="/contact#enquiry"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#E15B3F] to-[#d4482b] px-5 py-2 text-xs font-bold text-white shadow-[0_4px_16px_rgba(225,91,63,0.3)] transition-all duration-300 hover:shadow-[0_6px_24px_rgba(225,91,63,0.45)] active:scale-95"
            >
              <span className="relative z-10">Get Free Counselling</span>
              <HiArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="rounded-full p-2 text-slate-800 transition-colors duration-200 hover:bg-slate-100/80 lg:hidden"
            onClick={() => {
              setMobileOpen(true);
              onMobileMenuChange?.(true);
            }}
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>
        </nav>
      </div>

      {/* Premium Mobile Sheet Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[60] flex h-screen w-screen flex-col bg-slate-900/20 lg:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl"
            >
              {/* Header section */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <img
                  src="/medicologo-removebg-preview.png"
                  alt="Medico Overseas Logo"
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onMobileMenuChange?.(false);
                  }}
                  className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <HiX size={22} />
                </button>
              </div>

              {/* Scrollable links + Action buttons directly underneath */}
              <div className="flex flex-1 flex-col overflow-y-auto pr-1">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
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
                        className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
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
                        className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
                      >
                        {e.label}
                      </Link>
                    ))}
                  </MobileAccordion>

                  <Link
                    to="/blog"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
                  >
                    Blogs
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-[#E15B3F]/10 hover:text-[#E15B3F]"
                  >
                    Contact
                  </Link>
                </div>

                {/* CTAs flow right after the links with a clean, compact gap */}
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-full border border-slate-200 py-3 text-center text-xs font-bold text-slate-800"
                  >
                    Portal Login
                  </Link>
                  <Link
                    to="/contact#enquiry"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-full bg-[#E15B3F] py-3 text-center text-xs font-bold text-white shadow-lg shadow-[#E15B3F]/30"
                  >
                    Get Free Counselling
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const MobileAccordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 hover:bg-[#E15B3F]/10"
      >
        <span>{title}</span>
        <HiChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            open ? "rotate-180 text-[#E15B3F]" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden pl-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
