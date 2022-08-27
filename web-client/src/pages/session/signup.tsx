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

  const [emailError, setEmailError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordConfirmError, setPasswordConfirmError] = React.useState('');

  const router = useRouter();

  const onSignUpClick = async () => {
    try {
      await http.post(`http://localhost:4000/v1/users/register`, { email, username, password, passwordConfirm });

      router.push('/session/login');

      console.log('Sign-up is successful');
      alert('Sign-up successful');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        if (err.data.email) {
          setEmailError(`Error: ${err.data.email}`);
        } else setEmailError(``);

        if (err.data.username) {
          setUsernameError(`Error: ${err.data.username}`);
        } else setUsernameError(``);

        if (err.data.password) {
          setPasswordError(`Error: ${err.data.password}`);
        } else setPasswordError(``);

        if (err.data.passwordConfirm) {
          setPasswordConfirmError(`Error: ${err.data.passwordConfirm}`);
        } else setPasswordConfirmError(``);

        if (err.status == 500) {
          alert(`${err.status}: Internal server error`);
        }

        console.log(err.data);
      }
    }
  };

  return (
    <React.Fragment>
      E-mail: 
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <p>{emailError}</p>
      <br />

      Username:
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <p>{usernameError}</p>
      <br />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <p>{passwordError}</p>
      <br />

      Password confirmation:
      <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <p>{passwordConfirmError}</p>
      <br />

      <button onClick={onSignUpClick}>Sign Up</button>
    </React.Fragment>
  );
};

export default SignUpPage;