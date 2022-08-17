import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import { ServerAPI } from '../../types/openapi';
import { http, HttpResponse } from '../../utils/http';

const SignUpPage = () => {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');

  const router = useRouter();

  const onSignUpClick = async () => {
    try {
      await http.post(`http://localhost:4000/v1/auth/register`, { email, username, password, passwordConfirm });

      router.push('/session/login');

      alert('Sign up successful');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        // TODO: make it so that these alerts appear in specific areas
        if (err.data.email) {
          alert(`${err.status}: ${err.data.email}`);
        }

        if (err.data.username) {
          alert(`${err.status}: ${err.data.username}`);
        }

        if (err.data.password) {
          alert(`${err.status}: ${err.data.password}`);
        }

        if (err.data.passwordConfirm) {
          alert(`${err.status}: ${err.data.passwordConfirm}`);
        }

        if (err.data.raw) {
          alert(`${err.status}: Something unexpected happened`);
          console.log(err.data.raw);
        }
      } else {
        console.log(e);

        alert('Something unexpected happened');
      }
    }
  };

  return (
    <React.Fragment>
      E-mail: 
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />

      Username:
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <br />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />

      Password confirmation:
      <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <br />

      <button onClick={onSignUpClick}>Sign up</button>
    </React.Fragment>
  );
};

export default SignUpPage;