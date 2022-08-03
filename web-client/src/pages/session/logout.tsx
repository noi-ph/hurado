import React from 'react';

import { useRouter } from 'next/router';

import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { UserConstants } from './types';

const LogoutPage = () => {
  const router = useRouter();

  function redirectToLoginPage() {
    router.push('/session/login');
  }

  function runLogout() {
    try {
      localStorage.removeItem(UserConstants.CURRENT);
      localStorage.removeItem(UserConstants.JWT);
      redirectToLoginPage();
    } catch (err) {
      // TODO debug
    }
  }

  React.useEffect(runLogout);

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      Logging out...
    </Main>
  );
};

export default LogoutPage;
