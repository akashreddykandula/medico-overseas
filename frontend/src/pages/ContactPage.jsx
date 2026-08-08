import React from "react";
import { Helmet } from "react-helmet-async";
import { HiLocationMarker, HiPhone, HiMail, HiClock } from "react-icons/hi";
import PageHero from "../components/common/PageHero";
import EnquiryForm from "../components/home/forms/EnquiryForm";

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact Us | Medico Overseas</title>
      <meta
        name="description"
        content="Get in touch with Medico Overseas for free MBBS abroad counselling. Call, WhatsApp, or visit our office."
      />
    </Helmet>

    <PageHero
      eyebrow="GET IN TOUCH"
      title="Contact Medico Overseas"
      subtitle="Talk to our counsellors about your MBBS abroad journey — no obligation, no pressure."
    />

    <div className="section-container grid grid-cols-1 gap-12 py-16 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-1">
        {[
          [
            HiLocationMarker,
            "Office Address",
            "123 Education Tower, MG Road, Hyderabad, Telangana, India",
          ],
          [HiPhone, "Phone", "+91 6301878730"],
          [HiMail, "Email", "info@medicooverseas.com"],
          [HiClock, "Office Hours", "Mon – Sat, 10:00 AM – 7:00 PM IST"],
        ].map(([Icon, label, value]) => (
          <div key={label} className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
              <Icon size={22} />
            </div>
            <div>
              <p className="font-semibold text-navy-600">{label}</p>
              <p className="text-sm text-navy-400">{value}</p>
            </div>
          </div>
        ))}

        <div className="overflow-hidden rounded-2xl border border-navy-100">
          <iframe
            title="Medico Overseas office location"
            src="https://www.google.com/maps?q=Hyderabad,Telangana,India&output=embed"
            width="100%"
            height="220"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-card !bg-white p-8">
          <EnquiryForm source="contact_page" title="Send Us a Message" />
        </div>
      </div>
    </div>
  </>
);

export default ContactPage;
