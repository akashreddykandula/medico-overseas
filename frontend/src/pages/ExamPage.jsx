import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageHero from "../components/common/PageHero";
import EnquiryForm from "../components/home/forms/EnquiryForm";

const EXAM_CONTENT = {
  fmge: {
    title: "FMGE Exam",
    subtitle:
      "The licensing exam required for MBBS graduates from foreign universities to practice medicine in India.",
    sections: [
      {
        heading: "What is FMGE?",
        body: "The Foreign Medical Graduate Examination (FMGE), conducted by the National Board of Examinations, is mandatory for Indian citizens who complete their MBBS degree from a medical institution outside India, in order to be eligible for registration with the NMC and practice medicine in India.",
      },
      {
        heading: "Eligibility & Registration",
        body: "Candidates must hold a primary medical qualification from a university recognized by the NMC, with a program duration of at least 54 months (excluding internship). Registration typically opens ahead of each exam cycle via the NBE portal.",
      },
      {
        heading: "Exam Pattern & Frequency",
        body: "FMGE is a computer-based test with objective-type questions covering the full MBBS curriculum, conducted twice a year (June and December cycles).",
      },
      {
        heading: "How Medico Overseas Helps",
        body: "We provide structured FMGE preparation guidance, curated study resources, and mentorship from graduates who have successfully cleared the exam, alongside your MBBS admission support.",
      },
    ],
  },
  nmat: {
    title: "NMAT Exam",
    subtitle:
      "Understand eligibility, exam pattern, and how we support your preparation and registration.",
    sections: [
      {
        heading: "What is NMAT?",
        body: "NMAT refers to exams required as part of the admission or licensing process in certain MBBS-abroad destination countries. Requirements vary by country and university — our counsellors will confirm exactly which exam applies to your chosen destination during your consultation.",
      },
      {
        heading: "Eligibility & Exam Pattern",
        body: "Eligibility criteria and test format depend on the specific country/university combination. We provide destination-specific guidance once your preferred country is finalized.",
      },
      {
        heading: "How Medico Overseas Helps",
        body: "Our team assists with registration, preparation resources, and scheduling so this step fits smoothly into your overall admission timeline.",
      },
    ],
  },
};

const ExamPage = () => {
  const { examSlug } = useParams();
  const content = EXAM_CONTENT[examSlug] || EXAM_CONTENT.fmge;

  return (
    <>
      <Helmet>
        <title>{content.title} | Medico Overseas</title>
        <meta name="description" content={content.subtitle} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <PageHero
        eyebrow="LICENSING EXAM"
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="section-container grid grid-cols-1 gap-12 py-16 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-2xl font-bold text-navy-600">
                {s.heading}
              </h2>
              <p className="mt-4 leading-relaxed text-navy-500">{s.body}</p>
            </section>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="glass-card sticky top-28 !bg-white p-6">
            <EnquiryForm
              source="exam_page"
              title={`Get Guidance on ${content.title}`}
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default ExamPage;
