import React from 'react';

import { Hero } from 'components/Hero/Hero';
import { Footer } from 'components/Footer/Footer';
import { Features } from 'components/Features/Features';
import { FAQ } from 'components/FAQ/FAQ';

const LandingPage = () => (
  <React.Fragment>
    <Hero />
    <Features />
    <FAQ />

    <Footer />
  </React.Fragment>
);

export default LandingPage;
