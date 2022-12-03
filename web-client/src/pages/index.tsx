import React from 'react';

import { Hero } from 'components/Hero';
import { Footer } from 'components/Footer';
import { Features } from 'components/Features';
import { FAQ } from 'components/FAQ';
import { ProblemOverview } from 'components/Problems/Overview';

const LandingPage = () => (
  <React.Fragment>
    <Hero />
    <Features />
    <FAQ />
    <ProblemOverview titleAlign='right' slug='this-problem-is-so-fetch' />
    <Footer />
  </React.Fragment>
);

export default LandingPage;