import React from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { set, UserState } from '../redux/userSlice';
import { userStateLoader } from '../redux/store';

import { ServerAPI } from '../../types/openapi';
import { http, HttpResponse } from '../../utils/http';
import { UserConstants } from '../../utils/types';

const LoginPage = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: UserState) => state.user);

  const onLoginClick = async () => {
    try {
      const payload = { email, password };
      const response = await http.post(`http://localhost:4000/v1/auth/login`, payload);

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
      
      alert('You have logged in');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        // TODO: make it so that these alerts appear in specific areas
        if (err.data.email) {
          alert(`${err.status}: ${err.data.email}`);
        }

        if (err.data.password) {
          alert(`${err.status}: ${err.data.password}`);
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

  React.useEffect(() => {
    userStateLoader.saveState({ user });
  }, [loaded]);

  return (
    <React.Fragment>
      Email:
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />

      <button onClick={onLoginClick}>Log-in</button>
    </React.Fragment>
  );
};

export default LoginPage;