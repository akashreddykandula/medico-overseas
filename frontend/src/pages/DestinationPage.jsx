import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  HiCheckCircle,
  HiOutlineHome,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlineCheck,
  HiOutlinePhone,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineLibrary,
  HiOutlineUserGroup,
  HiOutlineChat,
} from "react-icons/hi";
import { FaWhatsapp, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import PageHero from "../components/common/PageHero";
import EnquiryForm from "../components/forms/EnquiryForm";
import { useCountry } from "../hooks/useCountries";
import { useBlogs } from "../hooks/useContent";

const extractSlug = (param) => param.replace(/^mbbs-in-/, "");

const DestinationPage = () => {
  const { slug: rawSlug } = useParams();
  const slug = extractSlug(rawSlug || "");
  const { data, isLoading, isError } = useCountry(slug);
  const { data: blogData } = useBlogs({ limit: 3 });

  // Interactive Checklist State
  const [checkedDocs, setCheckedDocs] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const toggleDoc = (idx) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Page link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-navy-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-coral border-t-transparent" />
          <p className="text-sm font-medium">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="section-container py-40 text-center text-navy-400">
        Destination details not found.
      </div>
    );
  }

  const { country, universities = [] } = data;
  const recentBlogs = blogData?.blogs || [];

  // 18 & 19. Schema.org JSON-LD structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      country.faqs?.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })) || [],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://medicooverseas.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: "https://medicooverseas.com/destinations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `MBBS in ${country.name}`,
        item: window.location.href,
      },
    ],
  };

  return (
    <>
      <Helmet>
        {/* 33. SEO Meta & Open Graph */}
        <title>
          {country.metaTitle ||
            `MBBS in ${country.name} for Indian Students | Fees & Universities`}
        </title>
        <meta
          name="description"
          content={country.metaDescription || country.shortDescription}
        />
        <link rel="canonical" href={window.location.href} />
        <meta
          property="og:title"
          content={`MBBS in ${country.name} - Complete Guide`}
        />
        <meta property="og:description" content={country.shortDescription} />
        <meta
          property="og:image"
          content={
            country.flagUrl ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200"
          }
        />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* 1. Breadcrumb Navigation */}
      <div className="bg-navy-900 py-3 text-xs text-slate-300">
        <div className="section-container flex items-center gap-2">
          <Link to="/" className="hover:text-coral">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-400">Destinations</span>
          <span>/</span>
          <span className="font-semibold text-coral">
            MBBS in {country.name}
          </span>
        </div>
      </div>

      {/* 2. Country Banner Section & Hero */}
      <div className="relative bg-navy-800 py-12 text-white">
        <div className="section-container grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-center">
          <div className="space-y-4 lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-coral/20 px-3 py-1 text-xs font-bold text-coral uppercase tracking-wide">
              <HiOutlineGlobeAlt size={16} /> Study Abroad
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              MBBS in {country.name}
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {country.shortDescription ||
                `Top NMC & WHO approved medical universities offering affordable MBBS programs in ${country.name}.`}
            </p>

            {/* Quick Highlights Bar */}
            <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">Duration</p>
                <p className="text-sm font-bold text-white">
                  {country.durationYears || "6"} Years
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">Medium</p>
                <p className="text-sm font-bold text-white">English</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">NEET</p>
                <p className="text-sm font-bold text-coral">Mandatory</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">
                  Recognition
                </p>
                <p className="text-sm font-bold text-white">NMC, WHO</p>
              </div>
            </div>

            {/* 21. Social Share & 22. Download Brochure */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a
                href="#enquiry-form"
                className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
              >
                <HiOutlineDownload size={16} /> Download Brochure PDF
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold">Share:</span>
                <button
                  onClick={handleCopyLink}
                  className="rounded-full bg-white/10 p-2 hover:bg-coral"
                >
                  <HiOutlineShare size={14} />
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 p-2 hover:bg-emerald-500"
                >
                  <FaWhatsapp size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="w-full section-container grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {/* 3. Quick Facts Section */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy-600 mb-4">
              Country Quick Facts
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Capital City</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.capital || "Major Academic Hub"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Currency</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.currency || "Local Currency"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Flight Duration</p>
                <p className="mt-1 font-bold text-navy-600">~6 to 9 Hours</p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Time Difference</p>
                <p className="mt-1 font-bold text-navy-600">
                  ~0.5 to 2.5 Hrs from IST
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Climate</p>
                <p className="mt-1 font-bold text-navy-600">
                  Moderate / Temperate
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">International Airports</p>
                <p className="mt-1 font-bold text-navy-600">Well Connected</p>
              </div>
            </div>
          </section>

          {/* 12. Country Highlights & 25. Recognition Badges */}
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Why Study in {country.name}?
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Safe for Indians", desc: "24/7 Security" },
                { label: "Indian Food", desc: "Mess Available" },
                { label: "NMC Approved", desc: "Eligible for NEXT" },
                { label: "WHO Listed", desc: "Global Practice" },
              ].map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-coral-100 bg-coral-50/50 p-4 text-center"
                >
                  <HiOutlineSparkles className="mx-auto text-coral" size={20} />
                  <p className="mt-2 font-bold text-navy-600 text-xs">
                    {h.label}
                  </p>
                  <p className="text-[10px] text-navy-400">{h.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. University Comparison Table */}
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Top Universities Comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-50 uppercase text-navy-400">
                  <tr>
                    <th className="p-3">University</th>
                    <th className="p-3">Tuition / Yr</th>
                    <th className="p-3">Hostel</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">NMC/WHO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {universities.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-navy-600">
                        {u.name}
                      </td>
                      <td className="p-3 font-bold text-coral">
                        ${u.fees?.tuitionPerYear || "4,000"}
                      </td>
                      <td className="p-3">${u.fees?.hostelPerYear || "800"}</td>
                      <td className="p-3">{u.durationYears || 6} Yrs</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600">
                          Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Detailed Fee Structure & 8. Living Cost Breakdown */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-navy-600 text-sm">
                Estimated Expense Breakdown
              </h3>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex justify-between border-b pb-1">
                  <span>Tuition Fee (Annual):</span>
                  <span className="font-bold">
                    ${country.fees?.avgTuitionPerYear || "4,000"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Hostel Accommodation:</span>
                  <span>$800 - $1,200</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Medical Insurance:</span>
                  <span>$200 / Year</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Documentation & Visa:</span>
                  <span>One-Time Charge</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-navy-600">
                  <span>Est. Annual Total:</span>
                  <span className="text-coral">
                    ${(country.fees?.avgTuitionPerYear || 4000) + 1200}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-navy-600 text-sm">
                Monthly Living Cost
              </h3>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex justify-between border-b pb-1">
                  <span>Indian Mess / Food:</span>
                  <span>$100 - $150</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Transport & Metro:</span>
                  <span>$20 - $30</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Internet & Utilities:</span>
                  <span>$15 - $25</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Personal Expenses:</span>
                  <span>$50</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-navy-600">
                  <span>Est. Monthly Total:</span>
                  <span className="text-coral">~$200 - $250</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6 & 7. Admission & Visa Timelines */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Admission & Visa Roadmap
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              {[
                {
                  title: "1. Free Counselling",
                  sub: "Profile evaluation & university choice",
                },
                {
                  title: "2. Document Submission",
                  sub: "Submit 10th, 12th & NEET transcripts",
                },
                {
                  title: "3. Admission Letter",
                  sub: "Receive official university confirmation",
                },
                {
                  title: "4. Ministry Invitation",
                  sub: "Official student invitation issuance",
                },
                {
                  title: "5. Visa Stamping",
                  sub: "Embassy file submission & approval",
                },
                {
                  title: "6. Departure & Onboarding",
                  sub: "Airport pickup & campus enrollment",
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-xl bg-navy-50/50 p-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral font-bold text-white text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-navy-600">{step.title}</p>
                    <p className="text-[11px] text-navy-400">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 11. Documents Checklist (Interactive UI) */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Interactive Document Checklist
            </h2>
            <p className="text-xs text-navy-400">
              Tick items as you prepare your application file:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              {[
                "Original Passport (18+ months validity)",
                "Class 10th Marksheet & Certificate",
                "Class 12th Marksheet (50%+ PCB)",
                "NEET UG Qualified Scorecard",
                "Passport Size Photographs (White background)",
                "Medical Fitness & HIV Test Report",
                "University Admission & Invitation Letter",
                "Bank Statement of Sponsor",
              ].map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDoc(idx)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    checkedDocs[idx]
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-100 bg-white text-navy-600 hover:border-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checkedDocs[idx] ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}
                  >
                    {checkedDocs[idx] && <HiOutlineCheck size={12} />}
                  </div>
                  <span className="font-medium">{doc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 14. Related Destinations */}
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Other Popular Destinations
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              {["Russia", "Georgia", "Uzbekistan", "Kazakhstan"].map(
                (dest, i) => (
                  <Link
                    key={i}
                    to={`/destinations/mbbs-in-${dest.toLowerCase()}`}
                    className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm hover:border-coral transition-colors"
                  >
                    <p className="font-bold text-navy-600">MBBS in {dest}</p>
                    <p className="text-[10px] text-coral mt-1">
                      Explore Fees →
                    </p>
                  </Link>
                ),
              )}
            </div>
          </section>

          {/* 15. Latest Blogs */}
          {recentBlogs.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-navy-600">
                Latest Guidance & Articles
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recentBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    to={`/blog/${blog.slug}`}
                    className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md"
                  >
                    <p className="line-clamp-2 text-xs font-bold text-navy-600 group-hover:text-coral">
                      {blog.title}
                    </p>
                    <p className="mt-2 text-[10px] text-navy-400">
                      Read Article →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 10. Climate & Weather */}
          <section className="rounded-2xl bg-navy-50 p-6 space-y-2">
            <h2 className="font-heading text-lg font-bold text-navy-600 flex items-center gap-2">
              <HiOutlineSun className="text-coral" /> Climate & Seasons
            </h2>
            <p className="text-xs text-navy-500 leading-relaxed">
              {country.climateNotes ||
                `Experiences pleasant summer temperatures (20°C to 28°C) and chilly winters. University hostels and campus halls are centrally heated for comfort.`}
            </p>
          </section>

          {/* 29. FAQs */}
          {country.faqs?.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-navy-600">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {country.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-navy-600 marker:content-none">
                      <span>{faq.question}</span>
                      <HiOutlineChevronDown
                        size={16}
                        className="text-coral transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-2 text-xs text-navy-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Sidebar / 32. Mobile Optimized Sticky Form */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
            <EnquiryForm
              source="destination_page"
              title={`Check Eligibility for MBBS in ${country.name}`}
            />
          </div>
        </aside>
      </div>

      {/* 16 & 31. Call-to-Action Banner Before Footer */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 py-12 text-white">
        <div className="section-container text-center space-y-4">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready to Begin Your MBBS Journey in {country.name}?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Get personalized guidance, university fee structures, and end-to-end
            admission support from our expert counselors.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <a
              href="#enquiry-form"
              className="rounded-lg bg-coral px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90"
            >
              Book Free Counselling
            </a>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
            >
              <FaWhatsapp size={16} /> WhatsApp Now
            </a>
          </div>
        </div>
      </div>

      {/* 17. Floating Contact Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <a
          href="https://wa.me/919999999999"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110"
          title="WhatsApp Support"
        >
          <FaWhatsapp size={22} />
        </a>
        <a
          href="tel:+919999999999"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white shadow-lg transition-transform hover:scale-110"
          title="Call Us"
        >
          <HiOutlinePhone size={20} />
        </a>
      </div>
    </>
  );
};

export default DestinationPage;
