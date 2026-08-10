import React from "react";
import { Helmet } from "react-helmet-async";

const LegalPage = ({ title, updatedDate, children }) => (
  <>
    <Helmet>
      <title>{title} | Medico Overseas</title>
      <meta
        name="description"
        content={`${title} for Medico Overseas. Read our policies, terms, and important information about using our website and MBBS abroad counselling services.`}
      />
      <link rel="canonical" href={window.location.href} />
      <meta property="og:title" content={`${title} | Medico Overseas`} />
      <meta
        property="og:description"
        content={`${title} for Medico Overseas. Read our policies, terms, and important information about using our website and MBBS abroad counselling services.`}
      />
      <meta
        property="og:image"
        content={`${window.location.origin}/medicologo.png`}
      />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Medico Overseas" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | Medico Overseas`} />
      <meta
        name="twitter:description"
        content={`${title} for Medico Overseas. Read our policies, terms, and important information about using our website.`}
      />
      <meta
        name="twitter:image"
        content={`${window.location.origin}/medicologo.png`}
      />
    </Helmet>
    {/* Legal Hero */}
    <section className="relative min-h-[320px] overflow-hidden text-white sm:min-h-[350px]">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2400&auto=format&fit=crop"
        alt="Legal Background"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark Navy Overlay */}
      <div className="absolute inset-0 bg-[#071A38]/55" />

      {/* Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/65 via-[#102F5C]/40 to-[#071A38]/55" />

      {/* Centered Content */}
      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-6 text-center sm:min-h-[350px]">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200 backdrop-blur-sm">
            LEGAL
          </span>

          <h1 className="mt-4 font-heading text-4xl font-extrabold text-white sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 text-sm text-white/75">
            Last updated: {updatedDate}
          </p>
        </div>
      </div>
    </section>
    <div className="section-container max-w-3xl space-y-6 py-16 text-navy-500">
      {children}
    </div>
  </>
);

export default LegalPage;
