import React from 'react';
import axios from 'axios';

import { User } from './types';
import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';

const LoginTest = () => {  
  const userJson = localStorage.getItem(User.CURRENT);
  const jwt = localStorage.getItem(User.JWT);

  if (userJson == null || jwt == null) {
    return (
      <Main meta={<Meta title={AppConfig.title} description={AppConfig.description}/>}>
        You are logged out
      </Main>
    )
  }

  try {
    const user = JSON.parse(userJson);
    (async () => await axios.get(`http://localhost:4000/v1/users/${user.id}`, {
      headers: {
        'Authorization': jwt
      }
    }));
    return (
      <Main meta={<Meta title={AppConfig.title} description={AppConfig.description}/>}>
        You are logged in as {user.email}
      </Main>
    )
  } catch (err) {
    alert('Your JWT token has expired! Logging out...');
    localStorage.removeItem(User.CURRENT);
    localStorage.removeItem(User.JWT);
    return (
      <Main meta={<Meta title={AppConfig.title} description={AppConfig.description}/>}>
        You are logged out
      </Main>
    )
  }
}

export default LoginTest