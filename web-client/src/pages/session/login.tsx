import React from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { set } from '../redux/userSlice';
import { userStateLoader } from '../redux/store';

import { http } from '../../utils/http';
import { UserConstants } from '../../utils/types';

const LoginPage = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: any) => state.user);

  const onLoginClick = async () => {
    try {
      const payload = { email, password };
      const response = await http.post(`http://localhost:4000/v1/auth/login`, payload);

      const data = response.data.data;
      let { jwt, user } = data;

      dispatch(set({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }));

      setLoaded(true);

      localStorage.setItem(UserConstants.JWT, jwt);
      localStorage.setItem(UserConstants.Current, JSON.stringify(user));
      router.push('/');
      
      alert('You have logged in');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const errorData = err.response?.data;

        // The console.log stays while the error isn't properly annotated
        console.log(errorData);

        alert(`${status}: ${errorData.errorMessage}`);
      } else {
        console.log(err);

        alert('Something unexpected happened');
      }
    }
  };

  React.useEffect(() => {
    userStateLoader.saveState(user);
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