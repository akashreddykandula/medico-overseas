import React from "react";
import LegalPage from "./LegalPage";
import {
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi"; // Adjust icon import path if needed to match your project

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
              By using the Medico Overseas website, you agree to use it only for
              lawful purposes related to seeking information about MBBS
              admissions abroad and our consultancy services.
            </p>
          </div>
        </div>
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
          All content on this site, including text, graphics, and logos, is the
          property of Medico Overseas unless otherwise noted, and may not be
          reproduced without permission.
        </p>
      </div>

      {/* Information Accuracy & Disclaimers Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <HiOutlineInformationCircle size={22} />
          </div>
          <h3 className="font-heading text-base font-bold text-navy-600">
            University & Service Disclaimers
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          Information about universities, fees, and eligibility is provided in
          good faith and subject to change by the respective institutions; final
          details will be confirmed during your consultation.
        </p>
      </div>

      {/* Disclaimer Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-navy-300">
        <HiOutlineExclamationCircle
          size={18}
          className="shrink-0 text-navy-300"
        />
        <span>
          This is placeholder legal text. Replace with content reviewed by
          qualified legal counsel before launch.
        </span>
      </div>
    </div>
  </LegalPage>
);

export default TermsPage;
