import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlus,
  HiMinus,
  HiSearch,
  HiOutlineQuestionMarkCircle,
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
      </Helmet>

      <PageHero
        eyebrow="HELP CENTER"
        title="Frequently Asked Questions"
        subtitle="Everything students and parents commonly ask about the MBBS-abroad journey."
      />

      <div className="section-container relative max-w-3xl py-16">
        {/* Search & Filter Bar */}
        <div className="relative mb-12">
          <div className="relative flex items-center">
            <HiSearch className="absolute left-4 text-navy-400" size={20} />
            <input
              type="text"
              placeholder="Search questions (e.g. eligibility, fees, NEET, visa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-navy-100 bg-white py-4 pl-12 pr-4 text-sm font-medium text-navy-600 shadow-sm transition-all focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-navy-400">
              Loading FAQs...
            </p>
          </div>
        )}

        {/* Grouped Accordions */}
        {!isLoading &&
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-12">
              <div className="mb-4 flex items-center gap-3 border-b border-navy-100 pb-2">
                <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-bold text-coral uppercase tracking-wider">
                  {CATEGORY_LABELS[category] || category}
                </span>
                <span className="text-xs font-semibold text-navy-400">
                  {items.length} {items.length === 1 ? "question" : "questions"}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((faq) => {
                  const isOpen = openId === faq._id;
                  return (
                    <div
                      key={faq._id}
                      className={`group rounded-2xl border transition-all duration-300 ${
                        isOpen
                          ? "border-coral/40 bg-white shadow-md"
                          : "border-navy-100 bg-white hover:border-navy-200 hover:shadow-sm"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAccordion(faq._id)}
                        className="flex w-full items-center justify-between p-5 text-left font-heading text-base font-semibold text-navy-600 transition-colors"
                      >
                        <span className="pr-4 leading-snug">
                          {faq.question}
                        </span>
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                            isOpen
                              ? "bg-coral text-white rotate-180"
                              : "bg-navy-50 text-navy-400 group-hover:bg-coral-50 group-hover:text-coral"
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
                            className="overflow-hidden px-5 pb-5 text-sm leading-relaxed text-navy-400"
                          >
                            <div className="pt-2 border-t border-navy-50">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 py-16 text-center">
            <HiOutlineQuestionMarkCircle size={40} className="text-navy-300" />
            <p className="mt-3 text-base font-semibold text-navy-600">
              No FAQs found
            </p>
            <p className="mt-1 text-xs text-navy-400">
              {searchQuery
                ? "Try searching with different keywords."
                : "FAQs will appear here once published."}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default FaqsPage;
