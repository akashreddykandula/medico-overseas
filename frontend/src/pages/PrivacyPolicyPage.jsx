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
              Medico Overseas ("we", "us", "our") collects personal information
              you submit through our enquiry forms — including your full name,
              phone number, email address, city, state, NEET score/qualification
              status, academic transcripts, and consultation messages — solely
              to provide end-to-end MBBS-abroad counselling and university
              admission processing.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Collection Categories */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <h3 className="font-heading text-base font-bold text-navy-600">
          1. Information We Collect
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-xs text-navy-500 sm:text-sm">
          <li>
            <strong className="text-navy-600">Personal & Identity Data:</strong>{" "}
            Name, age, date of birth, gender, and nationality required for
            university registration.
          </li>
          <li>
            <strong className="text-navy-600">Contact Details:</strong> Email
            address, mobile/WhatsApp number, residential address, and city.
          </li>
          <li>
            <strong className="text-navy-600">
              Academic & Eligibility Data:
            </strong>{" "}
            Class 10/12 mark sheets, NEET scores, passport details, and study
            preferences.
          </li>
          <li>
            <strong className="text-navy-600">Technical Data:</strong> IP
            address, browser type, device information, and site interaction logs
            collected automatically via standard cookies to improve platform
            performance.
          </li>
        </ul>
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
          We strictly maintain confidentiality and do not sell, rent, or trade
          your personal information to third parties. Information may be
          disclosed under the following controlled circumstances:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-xs text-navy-500 sm:text-sm">
          <li>
            <strong className="text-navy-600">
              Partner Universities & Foreign Ministries:
            </strong>{" "}
            Shared strictly to process your eligibility verification, offer
            letters, and student visa documentation with your prior
            authorization.
          </li>
          <li>
            <strong className="text-navy-600">
              Authorized Logistics Partners:
            </strong>{" "}
            Shared with verified translation, apostille, and travel management
            agents solely for processing admission files.
          </li>
          <li>
            <strong className="text-navy-600">Legal Compliance:</strong> When
            required by court orders, government authorities, or statutory
            mandates.
          </li>
        </ul>
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
          You hold complete ownership over your data. You may request access to,
          correction of, or permanent deletion of your personal records from our
          databases at any time by contacting us at{" "}
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

      {/* Data Retention & Security Policy */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
        <h3 className="font-heading text-base font-bold text-navy-600">
          Data Security & Retention
        </h3>
        <p className="text-xs leading-relaxed text-navy-500 sm:text-sm">
          We implement industry-standard encryption protocols (SSL/TLS), secure
          access controls, and restricted databases to prevent unauthorized
          access, loss, or misuse of your personal data. Applicant data is
          stored for the duration of the admission cycle and retained only as
          required by applicable legal and regulatory standards.
        </p>
      </div>

      {/* Policy Updates Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-navy-400">
        <HiOutlineExclamationCircle
          size={18}
          className="shrink-0 text-navy-400"
        />
        <span>
          Medico Overseas reserves the right to update this policy periodically
          to reflect changes in regulatory requirements or company procedures.
          Continued use of our portal signifies agreement with updated terms.
        </span>
      </div>
    </div>
  </LegalPage>
);

export default PrivacyPolicyPage;
