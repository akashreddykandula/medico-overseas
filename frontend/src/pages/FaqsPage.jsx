import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlus,
  HiMinus,
  HiSearch,
  HiOutlineQuestionMarkCircle,
  HiSparkles,
  HiOutlineBookOpen,
} from "react-icons/hi";
import PageHero from "../components/common/PageHero";
import { useFaqs } from "../hooks/useContent";

const CATEGORY_LABELS = {
  general: "General",
  admission: "Admission",
  fees: "Fees",
  visa: "Visa",
  fmge: "FMGE",
  nmat: "NMAT",
  country_specific: "Country-Specific",
};

const FaqsPage = () => {
  const { data: faqs = [], isLoading } = useFaqs();
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  // Filter FAQs based on search input without altering structure
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Existing grouping logic intact
  const grouped = filteredFaqs.reduce((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category].push(f);
    return acc;
  }, {});

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <Helmet>
        <title>FAQs | Medico Overseas</title>
        <meta
          name="description"
          content="Answers to common questions about MBBS admissions abroad, fees, visas, and licensing exams."
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <PageHero
        eyebrow="HELP CENTER"
        title="Frequently Asked Questions"
        subtitle="Everything students and parents commonly ask about the MBBS-abroad journey."
      />

      <div className="section-container relative max-w-4xl py-16 font-sans">
        {/* Decorative Background Ambient Glows */}
        <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-coral/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-80 w-80 rounded-full bg-navy-100/40 blur-3xl" />

        {/* Floating Search & Filter Bar */}
        <div className="relative mb-14">
          <div className="group relative flex items-center rounded-2xl border border-navy-100/80 bg-white/80 p-1.5 shadow-xl shadow-navy-900/5 backdrop-blur-xl transition-all duration-300 focus-within:border-coral/50 focus-within:ring-4 focus-within:ring-coral/10 hover:border-navy-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-400 transition-colors group-focus-within:bg-coral-50 group-focus-within:text-coral">
              <HiSearch size={22} />
            </div>
            <input
              type="text"
              placeholder="Search questions (e.g. eligibility, fees, NEET, visa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 text-sm font-medium text-navy-600 placeholder-navy-300 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-3 rounded-lg px-2 py-1 text-xs font-semibold text-navy-400 hover:bg-navy-50 hover:text-navy-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute h-full w-full animate-spin rounded-full border-2 border-coral border-t-transparent" />
              <HiOutlineBookOpen className="text-coral" size={16} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-navy-400">
              Loading Help Center...
            </p>
          </div>
        )}

        {/* Grouped Accordions */}
        {!isLoading &&
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-12">
              {/* Category Header Badge */}
              <div className="mb-5 flex items-center justify-between border-b border-navy-100/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-coral/10 text-coral">
                    <HiSparkles size={14} />
                  </span>
                  <h3 className="font-heading text-lg font-bold tracking-tight text-navy-600">
                    {CATEGORY_LABELS[category] || category}
                  </h3>
                </div>
                <span className="rounded-full bg-navy-50 px-3 py-1 text-[11px] font-bold text-navy-400">
                  {items.length} {items.length === 1 ? "Article" : "Articles"}
                </span>
              </div>

              {/* Accordion Cards */}
              <div className="space-y-3.5">
                {items.map((faq) => {
                  const isOpen = openId === faq._id;
                  return (
                    <div
                      key={faq._id}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                        isOpen
                          ? "border-coral/40 bg-white shadow-lg shadow-coral/5"
                          : "border-navy-100/80 bg-white/90 shadow-sm hover:border-coral/30 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      {/* Active Indicator Strip */}
                      <div
                        className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${
                          isOpen ? "bg-coral" : "bg-transparent"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => toggleAccordion(faq._id)}
                        className="flex w-full items-center justify-between p-5 text-left transition-colors sm:p-6"
                      >
                        <span
                          className={`pr-4 font-heading text-base font-bold transition-colors ${
                            isOpen
                              ? "text-coral"
                              : "text-navy-600 group-hover:text-navy-800"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                            isOpen
                              ? "border-coral bg-coral text-white rotate-180 shadow-md shadow-coral/25"
                              : "border-navy-100 bg-navy-50/60 text-navy-400 group-hover:border-coral/30 group-hover:bg-coral-50 group-hover:text-coral"
                          }`}
                        >
                          {isOpen ? (
                            <HiMinus size={16} />
                          ) : (
                            <HiPlus size={16} />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="overflow-hidden px-5 pb-6 text-sm leading-relaxed text-navy-400 sm:px-6"
                          >
                            <div className="pt-3 border-t border-navy-50 text-slate-600">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!isLoading && filteredFaqs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy-200 bg-white/60 p-12 text-center backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-300">
              <HiOutlineQuestionMarkCircle size={36} />
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-navy-600">
              No matching questions found
            </p>
            <p className="mt-1 max-w-sm text-xs text-navy-400">
              {searchQuery
                ? `We couldn't find any results matching "${searchQuery}". Try searching for terms like "NEET", "Visa", or "Tuition".`
                : "FAQs will appear here once published."}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default FaqsPage;
