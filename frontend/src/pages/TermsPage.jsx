import React from "react";
import LegalPage from "./LegalPage";
import {
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

const TermsPage = () => (
  <LegalPage title="Terms of Use" updatedDate="August 2026">
    <div className="space-y-8">
      {/* Intro Highlight Card — Website Use */}
      <div className="rounded-2xl border border-slate-100 bg-navy-50/50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral">
            <HiOutlineGlobe size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-base font-bold text-navy-600 sm:text-lg">
              Acceptance of Terms & Website Use
            </h3>
            <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
              By accessing and using the Medico Overseas platform, you agree to
              comply with and be bound by these Terms of Use. You agree to use
              our portal strictly for lawful purposes related to seeking genuine
              educational guidance and MBBS admission services abroad.
            </p>
          </div>
        </div>
      </div>

      {/* User Obligations & Services Offered */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <h3 className="font-heading text-base font-bold text-navy-600">
          1. Consultancy Services & Scope
        </h3>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          Medico Overseas acts as an official educational consultancy
          facilitating student applications to foreign medical universities.
          Submission of enquiry forms or registration does not guarantee
          admission or visa issuance, which remain at the sole discretion of the
          respective universities and government diplomatic missions.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-xs text-navy-500 sm:text-sm">
          <li>
            Applicants must provide accurate, complete, and truthful academic
            and identity documents.
          </li>
          <li>
            Providing fraudulent or falsified documentation will result in
            immediate termination of services without refund.
          </li>
        </ul>
      </div>

      {/* Intellectual Property Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
            <HiOutlineShieldCheck size={22} />
          </div>
          <h3 className="font-heading text-base font-bold text-navy-600">
            Intellectual Property & Content Ownership
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          All proprietary content on this platform — including text, logos,
          custom fee structure tables, graphic assets, software code, and
          brochure guides — is the intellectual property of Medico Overseas and
          protected under international copyright laws. Unauthorized scraping,
          reproduction, or redistribution without explicit written consent is
          strictly prohibited.
        </p>
      </div>

      {/* Information Accuracy & Disclaimers Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <HiOutlineInformationCircle size={22} />
          </div>
          <h3 className="font-heading text-base font-bold text-navy-600">
            University Fees & Information Disclaimer
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          Information regarding university tuition fees, hostel costs, currency
          exchange rates, and eligibility criteria (such as NEET cutoffs) is
          provided in good faith based on university guidelines. Fees and
          policies are subject to revision by foreign medical boards and
          institutions; binding figures will be confirmed during formal
          admission agreement execution.
        </p>
      </div>

      {/* Limitation of Liability */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <h3 className="font-heading text-base font-bold text-navy-600">
          Limitation of Liability
        </h3>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          Medico Overseas shall not be held liable for indirect, incidental, or
          consequential damages resulting from university policy revisions,
          international flight cancellations, changes in NMC/NEXT regulatory
          mandates, or embassy visa delays beyond our reasonable operational
          control.
        </p>
      </div>

      {/* Governing Law & Termination Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-navy-400">
        <HiOutlineExclamationCircle
          size={18}
          className="shrink-0 text-navy-400"
        />
        <span>
          These terms are governed by the laws of India. Medico Overseas
          reserves the right to modify these terms at any time. Continued
          platform usage indicates full acceptance of updated terms.
        </span>
      </div>
    </div>
  </LegalPage>
);

export default TermsPage;
