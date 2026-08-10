import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiClock,
  HiSparkles,
} from "react-icons/hi";

import EnquiryForm from "../components/home/forms/EnquiryForm";

const CONTACT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2400&auto=format&fit=crop";

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact Us | Medico Overseas</title>
      <meta
        name="description"
        content="Get in touch with Medico Overseas for free MBBS abroad counselling. Call, WhatsApp, or visit our office."
      />
      <link rel="canonical" href={window.location.href} />
      <meta property="og:title" content="Contact Us | Medico Overseas" />
      <meta
        property="og:description"
        content="Get in touch with Medico Overseas for free MBBS abroad counselling. Call, WhatsApp, or visit our office."
      />
      <meta
        property="og:image"
        content={`${window.location.origin}/medicologo.png`}
      />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Medico Overseas" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Contact Us | Medico Overseas" />
      <meta
        name="twitter:description"
        content="Get in touch with Medico Overseas for free MBBS abroad counselling."
      />
      <meta
        name="twitter:image"
        content={`${window.location.origin}/medicologo.png`}
      />
    </Helmet>

    {/* Contact Hero */}
    <section className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-[420px] overflow-hidden text-white bg-[#071A38]">
      {/* Background Image */}
      <motion.img
        src={CONTACT_HERO_IMAGE}
        alt="Contact Medico Overseas"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 5, ease: "easeOut" },
        }}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
      />

      {/* Multi-tier Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A38] via-[#071A38]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/80 via-transparent to-[#071A38]/80" />

      {/* Background Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-coral/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-5 top-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Centered Content */}
      <div className="relative z-10 flex min-h-[300px] sm:min-h-[380px] lg:min-h-[420px] items-center justify-center pt-16 sm:pt-20 pb-12">
        <div className="section-container text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-coral backdrop-blur-md shadow-2xs">
              <HiSparkles size={14} aria-hidden="true" />
              Get In Touch
            </span>

            <h1 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Contact Medico Overseas
            </h1>

            <p className="mx-auto mt-2.5 sm:mt-4 max-w-xl text-xs sm:text-base leading-relaxed text-slate-300">
              Talk to our counsellors about your MBBS abroad journey — no
              obligation, no pressure.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Main Contact Section */}
    <div className="relative bg-gradient-to-b from-white via-slate-50/50 to-white py-12 sm:py-20">
      <div className="section-container px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 items-start">
          {/* Left Side: Contact Information & Google Map */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-5">
            <div className="space-y-3 sm:space-y-4">
              {/* Address Card */}
              <div className="group flex items-start gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl transition-all duration-300 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/5">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white group-hover:scale-105">
                  <HiLocationMarker size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Office Address
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-navy-700 leading-relaxed">
                    123 Education Tower, MG Road, Hyderabad, Telangana, India
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <a
                href="tel:+916301878730"
                className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl transition-all duration-300 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/5"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white group-hover:scale-105">
                  <HiPhone size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-navy-700 transition-colors group-hover:text-coral">
                    +91 6301878730
                  </p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:info@medicooverseas.com"
                className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl transition-all duration-300 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/5"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white group-hover:scale-105">
                  <HiMail size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-navy-700 transition-colors group-hover:text-coral truncate">
                    info@medicooverseas.com
                  </p>
                </div>
              </a>

              {/* Office Hours Card */}
              <div className="group flex items-center gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl transition-all duration-300 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/5">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral transition-all duration-300 group-hover:bg-coral group-hover:text-white group-hover:scale-105">
                  <HiClock size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Office Hours
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-navy-700">
                    Mon – Sat, 10:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Embed Google Map */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-2 shadow-lg shadow-slate-100/70">
              <iframe
                title="Medico Overseas office location"
                src="https://www.google.com/maps?q=Hyderabad,Telangana,India&output=embed"
                width="100%"
                height="240"
                className="rounded-xl sm:rounded-2xl"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Side: Contact / Enquiry Form Container */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-100/80 backdrop-blur-xl">
              <EnquiryForm source="contact_page" title="Send Us a Message" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default ContactPage;
