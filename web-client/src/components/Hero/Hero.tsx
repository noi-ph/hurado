import React from 'react';
import { useRouter } from 'next/router';

import { Tarsier } from 'components/Logo/Tarsier';
import { Modals, showModal } from 'components/NavBar/LoggedOut';
import Styles from './Hero.module.css';

export const Hero = () => {
  const router = useRouter();

  return (
    <React.Fragment>
      <div className={`${Styles.algurado}`}>Algurado</div>
      <div className={`${Styles.hurado}`}>
        Online Judge by <img className={`${Styles.noi}`} src={`${router.basePath}/assets/images/NOI Logo.png`} />
      </div>
      <Tarsier className={`${Styles.tarsier}`} />
      <button className={`${Styles.join}`} onClick={() => showModal(Modals.Signup)}>
        Join us
      </button>
      <svg width="100%" height="100%" viewBox="0 0 720 327" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 0H720V327C577.534 278.989 584 297.218 368 265.5C152 233.782 137.4 272.205 0 327V0Z"
          fill="#0E0E2C"
        />
      </svg>
    </React.Fragment>
  );
};
