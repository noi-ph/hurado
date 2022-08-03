import React from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';
import { useAsyncEffect } from 'use-async-effect';

import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { UserConstants } from './types';

function validEmail(email: string) {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regex);
}

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const router = useRouter();

  function redirectToHomepage() {
    router.push('/');
  }

  async function checkLoggedIn() {
    const userJson = localStorage.getItem(UserConstants.CURRENT);
    const jwt = localStorage.getItem(UserConstants.JWT);
    if (userJson == null || jwt == null) {
      return false;
    }

    const user = JSON.parse(userJson);
    try {
      await axios.get(`http://localhost:4000/v1/users/${user.id}`, {
        headers: {
          Authorization: jwt,
        },
      });
      alert('You are already logged in!');
    } catch (err) {
      alert('Your JWT token has expired! Logging out...');
      localStorage.removeItem(UserConstants.CURRENT);
      localStorage.removeItem(UserConstants.JWT);
    } finally {
      redirectToHomepage();
    }
    return true;
  }

  async function onLoginClick() {
    if (!validEmail(email)) {
      alert('Invalid email!');
      return;
    }
    try {
      const payload = { email, password };
      const response = await axios.post(
        `http://localhost:4000/v1/auth/login`,
        payload
      );

      const jwt = response.data.data;
      const data = jwt.split(' ')[1]; // The first half is just 'Bearer'
      const second = data.split('.')[1]; // The first half is unimportant
      const userJson = atob(second);

      localStorage.setItem(UserConstants.CURRENT, userJson); // key-value pair must be strings
      localStorage.setItem(UserConstants.JWT, jwt);
      console.log(userJson, jwt);
      redirectToHomepage();
      alert('You have logged in');
    } catch (err: unknown) {
      alert('Invalid email or password!');
    }
  }

  useAsyncEffect(checkLoggedIn);

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      <>E-mail: </>
      <input value={email} onChange={(event) => setEmail(event.target.value)} />

      <>Password: </>
      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={onLoginClick}>Log-in</button>
    </Main>
  );
};

export default LoginPage;
