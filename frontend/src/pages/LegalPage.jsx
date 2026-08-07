import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHero from '../components/common/PageHero';

const LegalPage = ({ title, updatedDate, children }) => (
  <>
    <Helmet>
      <title>{title} | Medico Overseas</title>
    </Helmet>
    <PageHero eyebrow="LEGAL" title={title} subtitle={`Last updated: ${updatedDate}`} />
    <div className="section-container max-w-3xl space-y-6 py-16 text-navy-500">{children}</div>
  </>
);

export default LegalPage;
