import React from 'react';
import LegalPage from './LegalPage';

const PrivacyPolicyPage = () => (
  <LegalPage title="Privacy Policy" updatedDate="August 2026">
    <p>
      Medico Overseas ("we", "us") collects personal information you submit through our enquiry forms — including
      name, phone number, email, city, NEET score, and messages — solely to provide MBBS-abroad counselling
      services.
    </p>
    <p>
      We do not sell your personal information to third parties. Information may be shared with partner
      universities strictly for the purpose of processing your application, with your consent.
    </p>
    <p>
      You may request access to, correction of, or deletion of your personal data at any time by contacting us at{' '}
      <a href="mailto:privacy@medicooverseas.com" className="text-coral underline">
        privacy@medicooverseas.com
      </a>
      .
    </p>
    <p className="text-sm text-navy-300">
      This is placeholder legal text. Replace with content reviewed by qualified legal counsel before launch.
    </p>
  </LegalPage>
);

export default PrivacyPolicyPage;
