import { useRouter } from 'next/router';
import React from 'react';

import Styles from './Logo.module.css';
import { Tarsier } from './Tarsier';

export const Logo = () => {
  const router = useRouter();

  return (
    <button className={`${Styles.logo}`} onClick={() => router.push('/')}>
      a
      <span>
        <Tarsier className={`${Styles.tarsier}`} />
      </span>
      urado
    </button>
  );
};
