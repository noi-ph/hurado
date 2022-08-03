import React from 'react';
import axios from 'axios';

import { User } from './types';
import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { useAsyncEffect } from 'use-async-effect';

const LoginTest_ = () => {  
  const getCurrentUser = async () => {
    const userJson = localStorage.getItem(User.CURRENT);
    const jwt = localStorage.getItem(User.JWT);

    if (userJson == null || jwt == null) {
      return null;
    }

    const user = JSON.parse(userJson);
    try {
      await axios.get(`http://localhost:4000/v1/users/${user.id}`, {
        headers: {
          'Authorization': jwt
        }
      });
      return user;
    } catch (err) {
      return null;
    }
  };

  const [status, setStatus] = React.useState('loading');
  const [user, setUser] = React.useState(null);

  const checkIfLoggedInAndUpdateStatus = async () => {
    const user_ = await getCurrentUser();
    if (user_ != null) {
      setStatus('logged-in');
      setUser(user_);
    } else {
      setStatus('logged-out');
    }
  };

  useAsyncEffect(checkIfLoggedInAndUpdateStatus);

  try {
    if (status == 'loading') {
      return <div>Loading</div>;
    } else if (status == 'logged-in') {
      return <div>You are logged in as {user.email}</div>;
    } else if (status == 'logged-out') {
      return <div>You are logged out</div>;
    }
  } catch (err) {
    return <div>Something unexpected happened</div>
  }
}

const LoginTest = () => {
  return (
    <Main meta={<Meta title={AppConfig.title} description={AppConfig.description}/>}>
      <LoginTest_/>
    </Main>
  )
}

export default LoginTest