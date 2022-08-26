import React from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { set, UserState } from '../redux/userSlice';
import { userStateLoader } from '../redux/userSlice';

import { ServerAPI } from '../../types/openapi';
import { http, HttpResponse } from '../../utils/http';
import { UserConstants } from '../../utils/types';

const LoginPage = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: UserState) => state.user);

  const onLoginClick = async () => {
    try {
      const payload = { email, password };
      const response = await http.put(`http://localhost:4000/v1/users/login`, payload);

      const data = response.data;
      let { jwt, user } = data;

      dispatch(set({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }));

      setLoaded(true);

      localStorage.setItem(UserConstants.JWT, jwt);
      router.push('/');
      
      console.log('Log-in is successful');
      alert('You have logged in');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        if (err.data.email) {
          setEmailError(`Error: ${err.data.email}`);
        } else setEmailError(``);

        if (err.data.password) {
          setPasswordError(`Error: ${err.data.password}`);
        } else setPasswordError(``);

        if (err.status == 500) {
          alert(`${err.status}: Internal server error`);
        }

        console.log(err.data);
      } else {
        console.log(e);

        alert('Something unexpected happened');
      }
    }
  };

  React.useEffect(() => {
    userStateLoader.saveState({ user });
  }, [loaded]);

  return (
    <React.Fragment>
      Email:
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <p>{emailError}</p>
      <br />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <p>{passwordError}</p>
      <br />

      <button onClick={onLoginClick}>Log-in</button>
    </React.Fragment>
  );
};

export default LoginPage;