import React from 'react';
import LegalPage from './LegalPage';

const TermsPage = () => (
  <LegalPage title="Terms of Use" updatedDate="August 2026">
    <p>
      By using the Medico Overseas website, you agree to use it only for lawful purposes related to seeking
      information about MBBS admissions abroad and our consultancy services.
    </p>
    <p>
      All content on this site, including text, graphics, and logos, is the property of Medico Overseas unless
      otherwise noted, and may not be reproduced without permission.
    </p>
    <p>
      Information about universities, fees, and eligibility is provided in good faith and subject to change by the
      respective institutions; final details will be confirmed during your consultation.
    </p>
    <p className="text-sm text-navy-300">
      This is placeholder legal text. Replace with content reviewed by qualified legal counsel before launch.
    </p>
  </LegalPage>
);

export default TermsPage;
