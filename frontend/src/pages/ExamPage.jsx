import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { motion } from "framer-motion";
import EnquiryForm from "../components/home/forms/EnquiryForm";
const EXAM_HERO_IMAGE =
  "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2400&auto=format&fit=crop";

const EXAM_CONTENT = {
  fmge: {
    title: "FMGE Exam",
    subtitle:
      "Understand the Foreign Medical Graduate Examination, eligibility, registration, preparation, and the path toward medical practice in India.",

    sections: [
      {
        heading: "What is FMGE?",
        body: "The Foreign Medical Graduate Examination (FMGE) is a screening examination for eligible Indian citizens or overseas citizens of India who have obtained their primary medical qualification from a medical institution outside India and seek registration to practice medicine in India.",
      },

      {
        heading: "Who Should Take FMGE?",
        body: "FMGE is relevant to eligible medical graduates who completed their primary medical qualification outside India and need to meet the applicable Indian registration requirements. Students planning to study MBBS abroad should understand the licensing pathway before selecting a university.",
      },

      {
        heading: "FMGE Eligibility",
        body: "Eligibility depends on the candidate's nationality, primary medical qualification, university recognition, internship and other requirements prescribed by the competent Indian authorities. Students should verify the current eligibility requirements before applying.",
      },

      {
        heading: "FMGE Registration",
        body: "Eligible candidates register for the examination through the official examination authority's application process. Registration requirements, documents, application windows and fees should be checked against the latest official notification before submission.",
      },

      {
        heading: "FMGE Exam Pattern",
        body: "FMGE is conducted as a computer-based examination covering subjects from the medical curriculum. The detailed structure, number of questions, qualifying requirements and other examination rules should always be verified from the latest official notification.",
      },

      {
        heading: "FMGE Syllabus",
        body: "The examination covers subjects from the undergraduate medical curriculum, including pre-clinical, para-clinical and clinical disciplines. Students should prepare using the latest officially applicable syllabus and examination blueprint.",
      },

      {
        heading: "FMGE Exam Dates",
        body: "FMGE examination schedules and application deadlines are announced by the competent examination authority. Dates can change between examination cycles, so students should verify the latest official notification before planning registration or preparation.",
      },

      {
        heading: "FMGE Preparation & Coaching",
        body: "Medico Overseas can guide students with FMGE preparation planning, study resources, academic support and counselling regarding preparation strategies. Students should select preparation resources according to their individual academic requirements.",
      },
    ],

    faqs: [
      {
        question: "Who needs to appear for FMGE?",
        answer:
          "Eligible medical graduates who obtained their primary medical qualification outside India may need to meet the applicable screening and registration requirements before practising medicine in India.",
      },
      {
        question: "When should students start preparing for FMGE?",
        answer:
          "Students should build strong clinical and theoretical fundamentals throughout their medical education rather than waiting until graduation.",
      },
      {
        question: "Is FMGE preparation important while studying MBBS abroad?",
        answer:
          "Yes. Understanding Indian licensing requirements early can help students choose appropriate academic resources and maintain a structured preparation plan.",
      },
      {
        question: "Where can I check the latest FMGE dates?",
        answer:
          "Students should check the latest official examination notification before relying on any examination date or registration deadline.",
      },
    ],
  },

  nmat: {
    title: "NMAT Exam",
    subtitle:
      "Understand the relevance, eligibility, examination pattern and preparation requirements for the applicable NMAT pathway.",

    sections: [
      {
        heading: "What is NMAT?",
        body: "The exact NMAT examination referred to in this project must be confirmed with the client before final content is published. NMAT can refer to different examinations depending on the context, so the applicable examination, authority and destination should be clearly identified.",
      },

      {
        heading: "Why is NMAT Relevant?",
        body: "The relevance of NMAT depends on the specific examination and the country, university or admission pathway involved. Medico Overseas should confirm the intended NMAT examination with the client before publishing destination-specific requirements.",
      },

      {
        heading: "NMAT Eligibility",
        body: "Eligibility requirements depend on the specific NMAT examination being referenced. Once the examination is confirmed, this section should contain the official academic, age, nationality and other applicable requirements.",
      },

      {
        heading: "NMAT Exam Pattern",
        body: "The examination pattern should be published only after confirming the exact NMAT examination. The final content should cover sections, question types, duration, scoring and qualifying requirements where applicable.",
      },

      {
        heading: "NMAT Syllabus",
        body: "The syllabus depends on the exact NMAT examination. After confirmation from the client, this section should provide the relevant subjects, topics and preparation areas.",
      },

      {
        heading: "NMAT Registration",
        body: "Registration requirements, application procedure, documents, fees and deadlines should be added after confirming the exact NMAT examination and its official registration authority.",
      },

      {
        heading: "NMAT Preparation & Coaching",
        body: "Medico Overseas can provide guidance regarding preparation planning, study resources, registration and the overall examination process once the applicable NMAT examination has been confirmed.",
      },
    ],

    faqs: [
      {
        question: "Which NMAT examination does Medico Overseas refer to?",
        answer:
          "This needs to be confirmed with the client before finalizing the website content because NMAT can refer to different examinations depending on the context.",
      },
      {
        question: "Why does the exact NMAT examination need to be confirmed?",
        answer:
          "Eligibility, syllabus, examination pattern, registration process and preparation requirements can differ depending on the specific examination.",
      },
      {
        question: "Can students get NMAT guidance?",
        answer:
          "Yes. Medico Overseas can provide counselling and preparation guidance once the applicable examination and destination pathway have been confirmed.",
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
        <meta
          property="og:title"
          content={`${content.title} | Medico Overseas`}
        />
        <meta property="og:description" content={content.subtitle} />
        <meta
          property="og:image"
          content={`${window.location.origin}/medicologo.png`}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Medico Overseas" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${content.title} | Medico Overseas`}
        />
        <meta name="twitter:description" content={content.subtitle} />
        <meta
          name="twitter:image"
          content={`${window.location.origin}/medicologo.png`}
        />
      </Helmet>

      {/* Exam Hero */}
      <section className="relative min-h-[320px] overflow-hidden text-white sm:min-h-[350px]">
        {/* Background Image */}
        <motion.img
          src={EXAM_HERO_IMAGE}
          alt="Medical examination and education"
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
                LICENSING EXAM
              </span>

              <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">
                {content.title}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                {content.subtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

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
          {/* FAQs */}
          {content.faqs?.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-bold text-navy-600">
                Frequently Asked Questions
              </h2>

              <div className="mt-6 space-y-4">
                {content.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-sm font-bold text-navy-600">
                      <span>{faq.question}</span>

                      <span className="ml-4 text-coral transition-transform group-open:rotate-180">
                        ↓
                      </span>
                    </summary>

                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-navy-500">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
          {/* CTA */}
          <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 to-navy-800 p-8 text-white shadow-xl sm:p-10">
            <span className="text-xs font-bold uppercase tracking-widest text-coral">
              NEED GUIDANCE?
            </span>

            <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
              Plan Your {content.title.replace(" Exam", "")} Preparation
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Speak with our counsellors to understand eligibility, preparation,
              registration and the next steps for your examination journey.
            </p>

            <a
              href="#enquiry"
              className="mt-6 inline-flex rounded-xl bg-coral px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              Get Expert Guidance →
            </a>
          </section>
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
