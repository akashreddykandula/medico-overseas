import React from "react";
import { Helmet } from "react-helmet-async";
import {
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
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
    </Helmet>
    <Hero />
    <WhyStudyAbroad />
    <DestinationsGrid />
    <AdmissionProcess />
    <ExamsTeaser />
    <TestimonialsCarousel />
    <BlogHighlights />

    {/* Split Layout Section: Logo & Value Proposition on Left | Form on Right */}
    <section className="bg-navy py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-10 lg:p-12">
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
                <h2 className="font-heading text-2xl font-bold tracking-tight text-navy-700 sm:text-3xl">
                  Start Your Medical Career Journey Today
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Join thousands of Indian students studying MBBS abroad at top
                  NMC & WHO-recognized universities with complete transparency
                  and safety.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-2xl bg-navy-50/60 p-3.5">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-700">
                      NMC & WHO Recognized
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      100% eligible for NEXT & FMGE exams in India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-navy-50/60 p-3.5">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
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

                <div className="flex items-start gap-3 rounded-2xl bg-navy-50/60 p-3.5">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
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
