import React from "react";
import LegalPage from "./LegalPage";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
const PrivacyPolicyPage = () => (
  <LegalPage title="Privacy Policy" updatedDate="August 2026">
    <div className="space-y-8">
      {/* Intro Highlight Card */}
      <div className="rounded-2xl border border-slate-100 bg-navy-50/50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral">
            <HiOutlineShieldCheck size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-base font-bold text-navy-600 sm:text-lg">
              Data Collection & Usage
            </h3>
            <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
              Medico Overseas ("we", "us") collects personal information you
              submit through our enquiry forms — including name, phone number,
              email, city, NEET score, and messages — solely to provide
              MBBS-abroad counselling services.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Sharing Policy Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
            <HiOutlineLockClosed size={22} />
          </div>
          <h3 className="font-heading text-base font-bold text-navy-600">
            Information Sharing & Protection
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          We do not sell your personal information to third parties. Information
          may be shared with partner universities strictly for the purpose of
          processing your application, with your consent.
        </p>
      </div>

      {/* User Rights & Contact Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <HiOutlineUserGroup size={22} />
          </div>
          <h3 className="font-heading text-base font-bold text-navy-600">
            Your Rights & Data Control
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          You may request access to, correction of, or deletion of your personal
          data at any time by contacting us at{" "}
          <a
            href="mailto:privacy@medicooverseas.com"
            className="inline-flex items-center gap-1 font-bold text-coral underline hover:opacity-90"
          >
            <HiOutlineMail size={16} className="inline" />
            privacy@medicooverseas.com
          </a>
          .
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

export default PrivacyPolicyPage;
