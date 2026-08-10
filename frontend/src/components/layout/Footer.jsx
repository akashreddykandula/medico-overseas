import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiChevronRight,
} from "react-icons/hi";

const QUICK_LINKS = [
  { name: "About Us", path: "/about" },
  { name: "Blogs", path: "/blog" },
  { name: "Testimonials", path: "/testimonials" },
  { name: "Gallery", path: "/gallery" },
  { name: "FAQs", path: "/faqs" },
  { name: "Contact", path: "/contact" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms & Conditions", path: "/terms-and-conditions" },
];

const STUDY_DESTINATIONS = [
  { name: "MBBS in Armenia 🇦🇲", path: "/destinations/mbbs-in-armenia" },
  { name: "MBBS in Georgia 🇬🇪", path: "/destinations/mbbs-in-georgia" },
  { name: "MBBS in Kyrgyzstan 🇰🇬", path: "/destinations/mbbs-in-kyrgyzstan" },
  { name: "MBBS in Russia 🇷🇺", path: "/destinations/mbbs-in-russia" },
  { name: "MBBS in Uzbekistan 🇺🇿", path: "/destinations/mbbs-in-uzbekistan" },
  { name: "MBBS in Vietnam 🇻🇳", path: "/destinations/mbbs-in-vietnam" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#071A38] pt-16 sm:pt-20 pb-8 text-white border-t border-white/10">
      {/* Premium Ambient Background Backlights */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-coral/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="section-container relative z-10 px-4 sm:px-6">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-12 pb-12 border-b border-white/10">
          {/* Column 1: Logo, Tagline & Social Links */}
          <div className="space-y-6 lg:col-span-4">
            <Link
              to="/"
              className="inline-block transition-transform duration-300 hover:scale-105"
            >
              <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/20 inline-block border border-white/20">
                <img
                  src="/medicologo-removebg-preview.png"
                  alt="Medico Overseas Logo"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-sm">
              Your trusted, safety-first partner for MBBS admissions abroad —
              providing end-to-end guidance from university selection to
              licensing exams.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: FaFacebookF, href: "#", label: "Facebook" },
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaYoutube, href: "#", label: "YouTube" },
                { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-coral hover:bg-coral hover:text-white hover:shadow-lg hover:shadow-coral/25 hover:-translate-y-1"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links (Now includes Privacy Policy & Terms) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-coral" />

            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 transition-colors duration-200 hover:text-coral"
                  >
                    <HiChevronRight className="h-3.5 w-3.5 text-coral/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-coral" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Study Destinations */}
          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Study Destinations
            </h4>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-coral" />

            <ul className="mt-5 space-y-2.5">
              {STUDY_DESTINATIONS.map((dest) => (
                <li key={dest.name}>
                  <Link
                    to={dest.path}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 transition-colors duration-200 hover:text-coral"
                  >
                    <HiChevronRight className="h-3.5 w-3.5 text-coral/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-coral" />
                    <span>{dest.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Get in Touch */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Get In Touch
            </h4>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-coral" />

            <div className="mt-5 space-y-3">
              {/* Address Badge */}
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-coral/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
                  <HiOutlineLocationMarker size={18} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  123 Education Tower, MG Road, Hyderabad, Telangana, India
                </p>
              </div>

              {/* Phone Badge */}
              <a
                href="tel:+916301878730"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-coral/40 group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white">
                  <HiOutlinePhone size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 transition-colors group-hover:text-coral">
                  +91 6301878730
                </span>
              </a>

              {/* Email Badge */}
              <a
                href="mailto:info@medicooverseas.com"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-coral/40 group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white">
                  <HiOutlineMail size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 transition-colors group-hover:text-coral truncate">
                  info@medicooverseas.com
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright Bar */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© {currentYear} Medico Overseas. All rights reserved.</p>
          <p className="mt-3 text-center text-[9px] leading-relaxed text-slate-400">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-500"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-500"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
