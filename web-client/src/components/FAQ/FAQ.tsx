import React from 'react';

import Styles from './FAQ.module.css';

export const FAQ = () => (
  <React.Fragment>
    <div className={`${Styles.FAQ}`}>FAQs</div>
    <div className={`${Styles.text}`}>
      Filet mignon hamburger pork loin, ground round chislic prosciutto tri-tip ham hock alcatra tongue boudin doner
      turducken jerky rump.
      <li>
        Strip steak burgdoggen pork belly andouille, pancetta chicken turducken tenderloin tongue pig porchetta kielbasa
        sirloin rump. Pastrami chislic alcatra pig corned beef, jerky shoulder pancetta venison hamburger. Venison jerky
        alcatra pancetta beef frankfurter leberkas cow beef ribs.
      </li>
      <li>Tongue pastrami doner shank, cow shoulder drumstick.</li>
      Porchetta shoulder venison brisket beef ribs ham hock sirloin. Sirloin tenderloin beef ribs, drumstick cow
      shoulder jerky capicola picanha. Biltong beef tenderloin cow. Meatloaf boudin landjaeger sausage andouille rump
      filet mignon drumstick bacon t-bone buffalo.
    </div>
    <div align="center">
      <div className={`${Styles.line}`} />
    </div>
  </React.Fragment>
);
