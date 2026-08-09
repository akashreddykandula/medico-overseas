import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "../components/common/PageHero";

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
    <PageHero
      eyebrow="LEGAL"
      title={title}
      subtitle={`Last updated: ${updatedDate}`}
    />
    <div className="section-container max-w-3xl space-y-6 py-16 text-navy-500">
      {children}
    </div>
  </>
);

export default LegalPage;
