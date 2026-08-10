import React from "react";
import { Helmet } from "react-helmet-async";
import {
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiSparkles,
} from "react-icons/hi";
import Hero from "../components/home/Hero";
import WhyStudyAbroad from "../components/home/WhyStudyAbroad";
import DestinationsGrid from "../components/home/DestinationsGrid";
import AdmissionProcess from "../components/home/AdmissionProcess";
import ExamsTeaser from "../components/home/ExamsTeaser";
import TestimonialsCarousel from "../components/home/TestimonialsCarousel";
import BlogHighlights from "../components/home/BlogHighlights";
import EnquiryForm from "../components/home/forms/EnquiryForm";

const HomePage = () => (
  <>
    <Helmet>
      <title>
        Medico Overseas | Your Trusted Path to an MBBS Degree Abroad
      </title>

      <meta
        name="description"
        content="Get admission to NMC/WHO-recognized MBBS universities in Russia, Georgia, Kyrgyzstan, Uzbekistan, Armenia & Vietnam. Free counselling for Indian students."
      />
      <link rel="canonical" href={window.location.origin + "/"} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Medico Overseas",
          url: window.location.origin,
          logo: `${window.location.origin}/medicologo.png`,
          description:
            "Medico Overseas helps Indian students pursue MBBS abroad at recognized medical universities.",
          sameAs: [],
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Medico Overseas",
          url: window.location.origin,
        })}
      </script>
    </Helmet>
    <Hero />
    <WhyStudyAbroad />
    <DestinationsGrid />
    <AdmissionProcess />
    <ExamsTeaser />
    <TestimonialsCarousel />
    <BlogHighlights />

    {/* Split Layout Section: Logo & Value Proposition on Left | Form on Right */}
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-100 bg-coral-50/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-coral shadow-xs">
            <HiSparkles size={14} aria-hidden="true" />
            Free Consultation
          </span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-navy-700 sm:text-4xl lg:text-5xl">
            Book Your Free Counselling Session
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Speak directly with our senior educational advisors to plan your
            MBBS journey abroad.
          </p>
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Side: Logo & Trust Highlights */}
            <div className="space-y-6 lg:col-span-5">
              <div className="flex items-center">
                <img
                  src="/medicologo-removebg-preview.png"
                  alt="Medico Overseas Logo"
                  className="h-20 w-auto object-contain sm:h-24"
                />
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold tracking-tight text-navy-700 sm:text-3xl">
                  Start Your Medical Career Journey Today
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Join thousands of Indian students studying MBBS abroad at top
                  NMC & WHO-recognized universities with complete transparency
                  and safety.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-xs">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-700">
                      NMC & WHO Recognized
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Guidance for applicable Indian licensing and registration
                      requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-xs">
                    <HiOutlineShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-700">
                      Transparent & Zero Hidden Fees
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Complete fee clarity from day one with no surprise costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-xs">
                    <HiOutlineUserGroup size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-700">
                      24/7 On-Ground Support
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Airport pickup, hostel allotment, & local assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Enquiry Form */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6 lg:col-span-7">
              <EnquiryForm
                source="homepage"
                title="Get Free MBBS Abroad Counselling"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default HomePage;
