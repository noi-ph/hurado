import React from 'react';

import { Hero } from 'components/Hero';
import { Footer } from 'components/Footer';
import { Features } from 'components/Features';
import { FAQ } from 'components/FAQ';

const LandingPage = () => (
  <React.Fragment>
    <Hero />
    <Features />
    <FAQ />

    <Footer />
  </React.Fragment>
);

export default LandingPage;