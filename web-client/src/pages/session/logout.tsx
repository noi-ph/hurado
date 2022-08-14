import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { clear } from '../redux/userSlice';

import { UserConstants } from '../../utils/types';

const LogoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    try {
      localStorage.removeItem(UserConstants.Current);
      localStorage.removeItem(UserConstants.JWT);

      dispatch(clear());
    } catch (err) {
      console.log(err);
    } finally {
      router.push('/session/login');
    }
  }, [])

  return (
    <React.Fragment>
      Logging out...
    </React.Fragment>
  );
};

export default LogoutPage;