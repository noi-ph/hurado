import React from 'react';

import { User } from './types';
import { Meta } from '../../layout/Meta';
import { useRouter } from 'next/router';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';

const LogoutPage = () => {  
  const router = useRouter();

  function redirectToLoginPage() {
    router.push('/session/login');
  }

  function runLogout() {
    try {
      localStorage.removeItem(User.CURRENT);
      localStorage.removeItem(User.JWT);
      redirectToLoginPage();
    } catch (err) {
      // TODO debug
    }
  }

  React.useEffect(runLogout);

  return (
    <Main meta={<Meta title={AppConfig.title} description={AppConfig.description}/>}>
      Logging out...
    </Main>
  )
}

export default LogoutPage