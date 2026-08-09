import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { HiLocationMarker, HiPhone, HiMail, HiClock } from "react-icons/hi";

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
    <section className="relative min-h-[320px] overflow-hidden text-white sm:min-h-[350px]">
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
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Light Navy Overlay */}
      <div className="absolute inset-0 bg-[#071A38]/45" />

      {/* Soft Gradient for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/65 via-[#102F5C]/50 to-[#071A38]/45" />

      {/* Centered Content */}
      <div className="relative z-10 flex min-h-[320px] items-center justify-center sm:min-h-[350px]">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200 backdrop-blur-sm mt-14">
              GET IN TOUCH
            </span>

            <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">
              Contact Medico Overseas
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              Talk to our counsellors about your MBBS abroad journey — no
              obligation, no pressure.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    <div className="section-container grid grid-cols-1 gap-12 py-16 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-1">
        {[
          [
            HiLocationMarker,
            "Office Address",
            "123 Education Tower, MG Road, Hyderabad, Telangana, India",
          ],
          [HiPhone, "Phone", "+91 6301878730"],
          [HiMail, "Email", "info@medicooverseas.com"],
          [HiClock, "Office Hours", "Mon – Sat, 10:00 AM – 7:00 PM IST"],
        ].map(([Icon, label, value]) => (
          <div key={label} className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
              <Icon size={22} />
            </div>
            <div>
              <p className="font-semibold text-navy-600">{label}</p>
              <p className="text-sm text-navy-400">{value}</p>
            </div>
          </div>
        ))}

        <div className="overflow-hidden rounded-2xl border border-navy-100">
          <iframe
            title="Medico Overseas office location"
            src="https://www.google.com/maps?q=Hyderabad,Telangana,India&output=embed"
            width="100%"
            height="220"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-card !bg-white p-8">
          <EnquiryForm source="contact_page" title="Send Us a Message" />
        </div>
      </div>
    </div>
  </>
);

export default ContactPage;
