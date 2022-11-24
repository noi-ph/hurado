import React from 'react';
import { useRouter } from 'next/router';

import Styles from './Features.module.css';

export const Features = () => {
  const router = useRouter();

  return (
    <React.Fragment>
      <div className={`${Styles.question}`}>What's in Algurado?</div>
      <div align="center">
        <img className={`${Styles.circles}`} src={`${router.basePath}/Circles.png`} />
      </div>
    </React.Fragment>
  );
};
