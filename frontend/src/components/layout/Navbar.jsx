import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiChevronDown, HiSparkles } from "react-icons/hi";
import { useCountries } from "../../hooks/useCountries";

// --- BRAND CONSTANTS ---
const ORANGE = "#E15B3F";
const NAVY = "#1F3864";

//#E15B3F

//D94A28

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
  // const [loading, setLoading] = useState(true);
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
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Hide the public header entirely on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const navLinkClass =
    "text-xs font-bold uppercase tracking-wider transition-all duration-200 text-navy-700 hover:text-coral py-2";

  return (
    <>
      {/* Preloader only runs for non-admin/non-auth routes */}
      {/* {!isExcludedRoute && <Preloader show={loading} />} */}

      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-100 bg-white/95 backdrop-blur-xl shadow-md py-0"
            : "border-b border-transparent bg-white/90 backdrop-blur-md py-0"
        }`}
      >
        <nav className="section-container flex h-14 items-center justify-between">
          <Link
            to="/"
            aria-label="Medico Overseas home"
            className="flex items-center transition-transform hover:scale-[1.02]"
          >
            <img
              src="/medicologo-removebg-preview.png"
              alt="Medico OverSeas Logo"
              className="h-11 w-auto max-w-[180px] object-contain shrink"
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
              className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-navy-700 transition-all hover:border-coral hover:bg-coral-50/40 hover:text-coral"
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
            onClick={() => {
              setMobileOpen(true);
              onMobileMenuChange?.(true);
            }}
            aria-label="Open menu"
          >
            <HiMenu size={28} />
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
                  onClick={() => {
                    setMobileOpen(false);
                    onMobileMenuChange?.(false);
                  }}
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
