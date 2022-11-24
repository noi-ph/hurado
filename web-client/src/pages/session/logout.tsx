import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { clear } from 'redux/userSlice';

const LogoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    try {
      dispatch(clear());
    } catch (err) {
      console.log(err);
    } finally {
      // TODO: refer to previous visited page
      router.push('/');
    }
  }, [])

  return (
    <React.Fragment>
      Logging out...
    </React.Fragment>
  );
};

export default LogoutPage;