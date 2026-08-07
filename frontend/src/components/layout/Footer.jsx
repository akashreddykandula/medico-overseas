import React from "react";
import { Link } from "react-router-dom";
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiChevronRight,
} from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { useCountries } from "../../hooks/useCountries";

const SOCIAL_LINKS = [
  { Icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
  { Icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  const { data: countries = [] } = useCountries();

  return (
    <footer className="relative bg-[#0F2540] text-slate-200 pt-16 pb-8 border-t border-slate-800">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 bg-coral/5 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 bg-blue-500/5 blur-3xl" />

      <div className="section-container relative z-10 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 pb-12">
        {/* Brand & Logo Column */}
        <div className="space-y-5 lg:col-span-4">
          <Link
            to="/"
            className="inline-block rounded-2xl bg-white p-3 shadow-md transition-transform hover:scale-[1.02]"
          >
            <img
              src="/medicologo-removebg-preview.png"
              alt="Medico Overseas Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <p className="text-xs leading-relaxed text-slate-300 max-w-sm">
            Your trusted, safety-first partner for MBBS admissions abroad —
            providing end-to-end guidance from university selection to licensing
            exams.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {SOCIAL_LINKS.map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-coral hover:shadow-lg hover:shadow-coral/30"
                aria-label={label}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="lg:col-span-2">
          <h4 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-xs font-medium">
            {[
              ["About Us", "/about"],
              ["Blogs", "/blog"],
              ["Testimonials", "/testimonials"],
              ["Gallery", "/gallery"],
              ["FAQs", "/faqs"],
              ["Contact", "/contact"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-coral"
                >
                  <HiChevronRight
                    size={12}
                    className="text-coral opacity-0 transition-all duration-200 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Study Destinations Column */}
        <div className="lg:col-span-3">
          <h4 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
            Study Destinations
          </h4>
          <ul className="space-y-2.5 text-xs font-medium">
            {countries.map((c) => (
              <li key={c._id}>
                <Link
                  to={`/destinations/mbbs-in-${c.slug}`}
                  className="group flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-coral"
                >
                  <HiChevronRight
                    size={12}
                    className="text-coral opacity-0 transition-all duration-200 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                  <span>MBBS in {c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in Touch Column */}
        <div className="lg:col-span-3">
          <h4 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
            Get in Touch
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-3 text-slate-300">
              <div className="mt-0.5 rounded-lg bg-coral/10 p-1.5 text-coral shrink-0">
                <HiLocationMarker size={16} />
              </div>
              <span className="leading-relaxed">
                123 Education Tower, MG Road, Hyderabad, Telangana, India
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <div className="rounded-lg bg-coral/10 p-1.5 text-coral shrink-0">
                <HiPhone size={16} />
              </div>
              <a
                href="tel:+911234567890"
                className="transition-colors hover:text-coral font-medium"
              >
                +91 12345 67890
              </a>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <div className="rounded-lg bg-coral/10 p-1.5 text-coral shrink-0">
                <HiMail size={16} />
              </div>
              <a
                href="mailto:info@medicooverseas.com"
                className="transition-colors hover:text-coral font-medium"
              >
                info@medicooverseas.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800/80 pt-6 mt-4">
        <div className="section-container flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Medico Overseas. All rights reserved.
          </p>
          <div className="flex gap-6 font-medium">
            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-coral"
            >
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-coral">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
