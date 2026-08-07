import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHero from '../components/common/PageHero';
import { useFaqs } from '../hooks/useContent';

const CATEGORY_LABELS = {
  general: 'General',
  admission: 'Admission',
  fees: 'Fees',
  visa: 'Visa',
  fmge: 'FMGE',
  nmat: 'NMAT',
  country_specific: 'Country-Specific',
};

const FaqsPage = () => {
  const { data: faqs = [], isLoading } = useFaqs();

  const grouped = faqs.reduce((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>FAQs | Medico Overseas</title>
        <meta name="description" content="Answers to common questions about MBBS admissions abroad, fees, visas, and licensing exams." />
      </Helmet>

      <PageHero eyebrow="HELP CENTER" title="Frequently Asked Questions" subtitle="Everything students and parents commonly ask about the MBBS-abroad journey." />

      <div className="section-container max-w-3xl py-16">
        {isLoading && <p className="text-center text-navy-400">Loading FAQs...</p>}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="font-heading text-xl font-bold text-navy-600">{CATEGORY_LABELS[category] || category}</h2>
            <div className="mt-4 space-y-3">
              {items.map((faq) => (
                <details key={faq._id} className="group rounded-xl border border-navy-100 p-4">
                  <summary className="cursor-pointer font-medium text-navy-600 marker:content-none">{faq.question}</summary>
                  <p className="mt-2 text-sm text-navy-400">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        {!isLoading && faqs.length === 0 && <p className="text-center text-navy-400">FAQs will appear here once published.</p>}
      </div>
    </>
  );
};

export default FaqsPage;
