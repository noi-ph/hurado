import React from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { validEmail } from '../../utils/Email';
import { UserConstants } from './types';

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const router = useRouter();

  function redirectToHomepage() {
    router.push('/');
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

      localStorage.setItem(UserConstants.Current, userJson); // key-value pair must be strings
      localStorage.setItem(UserConstants.JWT, jwt);
      redirectToHomepage();
      alert('You have logged in');
    } catch (err: unknown) {
      alert('Invalid email or password!');
    }
  }

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
