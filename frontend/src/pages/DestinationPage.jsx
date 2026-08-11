import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineChevronDown,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlineCheck,
  HiOutlinePhone,
  HiOutlineSparkles,
  HiOutlineSun,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import EnquiryForm from "../components/home/forms/EnquiryForm";
import { useCountry, useCountries } from "../hooks/useCountries";
import { useBlogs } from "../hooks/useContent";

const extractSlug = (param = "") => String(param).replace(/^mbbs-in-/, "");

const DestinationPage = () => {
  const { slug: rawSlug } = useParams();
  const slug = extractSlug(rawSlug || "");
  const WHATSAPP_URL = "https://wa.me/916301878730";
  const { data, isLoading, isError } = useCountry(slug);
  const { data: countriesData } = useCountries();
  const { data: blogData } = useBlogs({ limit: 3 });

  // Interactive Checklist State
  const [checkedDocs, setCheckedDocs] = useState({});

  const toggleDoc = (idx) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Page link copied to clipboard!");
    } catch (error) {
      console.error("Copy link error:", error);
      toast.error("Unable to copy the page link.");
    }
  };

  const handleDownloadBrochure = async () => {
    if (!data?.country) return;
    const { country } = data;

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
        /\/$/,
        "",
      );

      const brochureUrl = `${apiBaseUrl}/countries/${encodeURIComponent(
        country.slug,
      )}/brochure`;

      const response = await fetch(brochureUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Brochure request failed with status ${response.status}`,
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.toLowerCase().includes("application/pdf")) {
        throw new Error("The server did not return a PDF file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const safeCountryName = String(country.name || "Country")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");

      link.download = `MBBS_in_${safeCountryName || "Country"}_Brochure.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Brochure download error:", error);
      alert("Unable to download brochure. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="section-container min-h-[500px] py-16 flex flex-col items-center justify-center">
        {/* Animated Floating Radar / Globe Visual */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-28 w-28 animate-ping rounded-full bg-coral/20 duration-1000" />
          <div className="absolute h-20 w-20 animate-pulse rounded-full bg-navy-100" />

          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral text-white shadow-lg shadow-coral/30">
            <HiOutlineGlobeAlt
              size={32}
              className="animate-spin"
              style={{ animationDuration: "6s" }}
            />
          </div>
        </div>

        {/* Dynamic Text with Progress Indicators */}
        <div className="mt-6 text-center space-y-2">
          <h3 className="font-heading text-lg font-bold text-navy-600 tracking-wide">
            Exploring Destinations...
          </h3>
          <p className="text-xs text-navy-400 animate-pulse max-w-xs">
            Fetching top universities, fee structures, and entry requirements
          </p>
        </div>

        {/* Progress Line Bar */}
        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-navy-50">
          <div className="h-full w-full bg-gradient-to-r from-coral via-coral-400 to-navy-600 animate-[shimmer_1.5s_infinite] -translate-x-full bg-[length:200%_100%]" />
        </div>

        {/* Quick Feature Dots Preview */}
        <div className="mt-8 flex items-center gap-6 text-[11px] text-navy-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />{" "}
            NMC Approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />{" "}
            WHO Recognized
          </span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="section-container py-20 lg:py-40 text-center text-navy-400">
        Destination details not found.
      </div>
    );
  }

  const { country, universities = [] } = data;
  const recentBlogs = blogData?.blogs || [];

  const allCountries = countriesData?.countries || [];
  const relatedDestinations =
    country.relatedCountries?.length > 0
      ? country.relatedCountries
      : allCountries.filter((c) => c._id !== country._id).slice(0, 4);

  // Schema.org JSON-LD structured data
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
            country.heroImage?.url ||
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

      {/* 2. Country Banner Section & Hero */}
      <div className="relative overflow-hidden bg-navy-800 py-8 sm:py-12 text-white">
        {country.heroImage?.url && (
          <img
            src={country.heroImage.url}
            alt={`MBBS in ${country.name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-navy-900/75" />

        <div className="section-container relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
          <div className="space-y-4 lg:col-span-2">
            <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-coral/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-coral sm:text-xs">
              <HiOutlineGlobeAlt size={16} /> Study Abroad
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              MBBS in {country.name}
            </h1>
            <p className="text-xs sm:text-base leading-relaxed text-slate-300">
              {country.shortDescription ||
                `Explore MBBS study opportunities, universities, fees, and admission information in ${country.name}.`}
            </p>

            {/* Quick Highlights Bar */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 sm:pt-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">Duration</p>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {country.durationYears || "6"} Years
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">Medium</p>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {country.mediumOfInstruction || "English"}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">NEET</p>
                <p className="text-xs sm:text-sm font-bold text-coral">
                  {country.eligibility?.neetRequired
                    ? "Mandatory"
                    : "Not Required"}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-sm">
                <p className="text-[10px] text-slate-300 uppercase">
                  Recognition
                </p>
                <p className="text-xs sm:text-sm font-bold text-white">
                  NMC, WHO
                </p>
              </div>
            </div>

            {/* Social Share & Download Brochure */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={handleDownloadBrochure}
                className="flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2.5 sm:py-2 text-xs font-bold text-white shadow-md hover:opacity-90 w-full sm:w-auto text-center"
              >
                <HiOutlineDownload size={16} /> Download Brochure PDF
              </button>
              <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-slate-300 pt-1 sm:pt-0">
                <span className="font-semibold">Share:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="rounded-full bg-white/10 p-2 hover:bg-coral transition-colors"
                  >
                    <HiOutlineShare size={14} />
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 p-2 hover:bg-emerald-500 transition-colors"
                  >
                    <FaWhatsapp size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="w-full section-container grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-3">
        <div className="space-y-8 sm:space-y-12 lg:col-span-2">
          {/* 3. Quick Facts Section */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600 mb-4">
              Country Quick Facts
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:grid-cols-3">
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Capital City</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.capital || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Currency</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.currency || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Flight Duration</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.flightDuration || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Time Difference</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.timeDifference || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">Climate</p>
                <p className="mt-1 font-bold text-navy-600 line-clamp-2">
                  {country.climateNotes || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-navy-50/50 p-3">
                <p className="text-navy-400">International Airports</p>
                <p className="mt-1 font-bold text-navy-600">
                  {country.internationalAirports || "Not specified"}
                </p>
              </div>
            </div>
          </section>

          {/* Country Highlights & Recognition Badges */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
              Why Study in {country.name}?
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
              {[
                { label: "Safe for Indians", desc: "24/7 Security" },
                { label: "Indian Food", desc: "Mess Available" },
                { label: "NMC Approved", desc: "Eligible for NEXT" },
                { label: "WHO Listed", desc: "Global Practice" },
              ].map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-coral-100 bg-coral-50/50 p-3 sm:p-4 text-center"
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

          {/* 5. Top Universities Comparison Table (Dynamic Cards & Table) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Top Universities in {country.name}
              </h2>
              <span className="text-xs text-navy-400 font-medium">
                {universities.length}{" "}
                {universities.length === 1 ? "University" : "Universities"}{" "}
                Listed
              </span>
            </div>

            {universities.length > 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Mobile Cards View */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {universities.map((u) => (
                    <div key={u._id} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {u.logo?.url ? (
                          <img
                            src={u.logo.url}
                            alt={u.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-400">
                            <HiOutlineAcademicCap size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-navy-600 text-xs sm:text-sm">
                            {u.name}
                          </p>
                          {u.establishedYear && (
                            <p className="text-[10px] text-navy-400">
                              Estd. {u.establishedYear}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-navy-400 block">
                            Tuition / Yr
                          </span>
                          <span className="font-bold text-coral">
                            {u.fees?.tuitionPerYear
                              ? `${u.fees?.currency || "USD"} ${u.fees.tuitionPerYear.toLocaleString()}`
                              : "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-navy-400 block">
                            Hostel
                          </span>
                          <span className="font-medium text-navy-600">
                            {u.hostelAvailable
                              ? u.fees?.hostelPerYear
                                ? `${u.fees?.currency || "USD"} ${u.fees.hostelPerYear.toLocaleString()}`
                                : "Available"
                              : "Not Available"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-navy-400 block">
                            Duration
                          </span>
                          <span className="font-medium text-navy-600">
                            {u.durationYears
                              ? `${u.durationYears} Yrs`
                              : "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-navy-400 block">
                            Approvals
                          </span>
                          <div className="flex gap-1 mt-0.5">
                            {u.nmcApproved === true && (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600 text-[9px]">
                                NMC
                              </span>
                            )}
                            {u.whoRecognized === true && (
                              <span className="rounded-full bg-sky-50 px-1.5 py-0.5 font-bold text-sky-600 text-[9px]">
                                WHO
                              </span>
                            )}
                            {!u.nmcApproved && !u.whoRecognized && (
                              <span className="text-[10px] text-slate-400">
                                Not Specified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-50 uppercase text-navy-400">
                      <tr>
                        <th className="p-3">University</th>
                        <th className="p-3">Tuition / Yr</th>
                        <th className="p-3">Hostel</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Approvals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {universities.map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-3 font-semibold text-navy-600">
                            <div className="flex items-center gap-3">
                              {u.logo?.url ? (
                                <img
                                  src={u.logo.url}
                                  alt={u.name}
                                  className="h-8 w-8 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-400">
                                  <HiOutlineAcademicCap size={16} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-navy-600">
                                  {u.name}
                                </p>
                                {u.establishedYear && (
                                  <p className="text-[10px] text-navy-400">
                                    Estd. {u.establishedYear}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-coral">
                            {u.fees?.tuitionPerYear
                              ? `${u.fees?.currency || "USD"} ${u.fees.tuitionPerYear.toLocaleString()}`
                              : "Not specified"}
                          </td>
                          <td className="p-3">
                            {u.hostelAvailable
                              ? u.fees?.hostelPerYear
                                ? `${u.fees?.currency || "USD"} ${u.fees.hostelPerYear.toLocaleString()}`
                                : "Available"
                              : "Not Available"}
                          </td>
                          <td className="p-3">
                            {u.durationYears
                              ? `${u.durationYears} Yrs`
                              : "Not specified"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {u.nmcApproved === true && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 text-[10px]">
                                  NMC
                                </span>
                              )}

                              {u.whoRecognized === true && (
                                <span className="rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-600 text-[10px]">
                                  WHO
                                </span>
                              )}

                              {!u.nmcApproved && !u.whoRecognized && (
                                <span className="text-[10px] text-slate-400">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 sm:p-8 text-center text-xs text-navy-400">
                No universities currently listed for {country.name}.
              </div>
            )}
          </section>

          {/* 4. Detailed Fee Structure & Living Cost Breakdown */}
          <section className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-navy-600 text-sm">
                Estimated Expense Breakdown
              </h3>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex justify-between border-b pb-1">
                  <span>Tuition Fee (Annual):</span>
                  <span className="font-bold">
                    {country.fees?.tuitionPerYear
                      ? `${country.fees?.currency || "USD"} ${country.fees.tuitionPerYear.toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Hostel Accommodation:</span>
                  <span className="font-bold">
                    {country.fees?.hostelPerYear
                      ? `${country.fees?.currency || "USD"} ${country.fees.hostelPerYear.toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Mess Fee:</span>
                  <span className="font-bold">
                    {country.fees?.messPerYear
                      ? `${country.fees?.currency || "USD"} ${country.fees.messPerYear.toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>One-Time Costs:</span>
                  <span className="font-bold">
                    {country.fees?.oneTimeCosts
                      ? `${country.fees?.currency || "USD"} ${country.fees.oneTimeCosts.toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-navy-600">
                  <span>Est. Annual Total:</span>
                  <span className="text-coral">
                    {(country.fees?.tuitionPerYear || 0) +
                      (country.fees?.hostelPerYear || 0) +
                      (country.fees?.messPerYear || 0) >
                    0
                      ? `${country.fees?.currency || "USD"} ${(
                          (country.fees?.tuitionPerYear || 0) +
                          (country.fees?.hostelPerYear || 0) +
                          (country.fees?.messPerYear || 0)
                        ).toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-navy-600 text-sm">
                Monthly Living Cost
              </h3>

              <div className="space-y-3 text-xs text-navy-500">
                <div className="flex justify-between border-b pb-2">
                  <span>Estimated Monthly Cost:</span>

                  <span className="font-bold text-coral">
                    {country.livingCost?.monthlyEstimate
                      ? `${country.livingCost?.currency || "USD"} ${country.livingCost.monthlyEstimate.toLocaleString()}`
                      : "Not specified"}
                  </span>
                </div>

                {country.livingCost?.notes && (
                  <p className="leading-relaxed text-navy-400">
                    {country.livingCost.notes}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 6 & 7. Admission & Visa Timelines */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
              Admission & Visa Roadmap
            </h2>
            {country.admissionProcess?.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                {country.admissionProcess.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-xl bg-navy-50/50 p-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral font-bold text-white text-[10px]">
                      {idx + 1}
                    </div>

                    <div>
                      <p className="font-bold text-navy-600">{step.step}</p>

                      <p className="text-[11px] text-navy-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-400">
                Admission process information is currently unavailable.
              </p>
            )}
          </section>

          {country.visaProcess && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-3">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Student Visa Process
              </h2>

              <p className="text-xs leading-relaxed text-navy-500 whitespace-pre-line">
                {country.visaProcess}
              </p>
            </section>
          )}

          {country.studentLifeNotes && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-3">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Student Life
              </h2>

              <p className="text-xs leading-relaxed text-navy-500 whitespace-pre-line">
                {country.studentLifeNotes}
              </p>
            </section>
          )}

          {/* 11. Documents Checklist */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
              Interactive Document Checklist
            </h2>
            <p className="text-xs text-navy-400">
              Tick items as you prepare your application file:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              {country.requiredDocuments?.length > 0 ? (
                country.requiredDocuments.map((doc, idx) => (
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
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        checkedDocs[idx]
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {checkedDocs[idx] && <HiOutlineCheck size={12} />}
                    </div>

                    <span className="font-medium">{doc}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-navy-400">
                  Required document information is currently unavailable.
                </p>
              )}
            </div>
          </section>

          {/* 14. Related Destinations */}
          {relatedDestinations.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Other Popular Destinations
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4 text-xs">
                {relatedDestinations.map((dest) => (
                  <Link
                    key={dest._id || dest.slug}
                    to={`/destinations/${dest.slug?.startsWith("mbbs-in-") ? dest.slug : `mbbs-in-${dest.slug}`}`}
                    className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm hover:border-coral transition-colors"
                  >
                    <p className="font-bold text-navy-600">
                      MBBS in {dest.name}
                    </p>
                    <p className="text-[10px] text-coral mt-1">
                      Explore Fees →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 15. Latest Blogs */}
          {recentBlogs.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Latest Guidance & Articles
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
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
          <section className="rounded-2xl bg-navy-50 p-4 sm:p-6 space-y-2">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy-600 flex items-center gap-2">
              <HiOutlineSun className="text-coral shrink-0" /> Climate & Seasons
            </h2>
            <p className="text-xs text-navy-500 leading-relaxed">
              {country.climateNotes ||
                "Climate information is currently unavailable for this destination."}
            </p>
          </section>

          {/* FAQs */}
          {country.faqs?.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-600">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {country.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-navy-600 marker:content-none gap-2">
                      <span>{faq.question}</span>
                      <HiOutlineChevronDown
                        size={16}
                        className="text-coral shrink-0 transition-transform group-open:rotate-180"
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

        {/* Sticky Sidebar */}
        <aside className="lg:col-span-1">
          <div
            className="sticky top-24 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-xl"
            id="enquiry-form"
          >
            <EnquiryForm
              source="destination_page"
              title={`Check Eligibility for MBBS in ${country.name}`}
            />
          </div>
        </aside>
      </div>

      {/* Call-to-Action Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 py-8 sm:py-12 text-white">
        <div className="section-container text-center space-y-4">
          <h2 className="font-heading text-xl font-bold sm:text-3xl px-2">
            Ready to Begin Your MBBS Journey in {country.name}?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto px-2">
            Get personalized guidance, university fee structures, and end-to-end
            admission support from our expert counselors.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 pt-2 px-4 sm:px-0">
            <a
              href="#enquiry-form"
              className="rounded-lg bg-coral px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 w-full sm:w-auto"
            >
              Book Free Counselling
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 w-full sm:w-auto"
            >
              <FaWhatsapp size={16} /> WhatsApp Now
            </a>
          </div>
        </div>
      </div>

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <a
          href="https://wa.me/916301878730"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110"
          title="WhatsApp Support"
        >
          <FaWhatsapp size={22} />
        </a>

        <a
          href="tel:+916301878730"
          className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white shadow-lg transition-transform hover:scale-110"
          title="Call Us"
        >
          <HiOutlinePhone size={20} />
        </a>
      </div>
    </>
  );
};

export default DestinationPage;
