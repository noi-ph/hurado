import React from 'react';
import { useSelector } from 'react-redux';

import { UserState } from '../redux/userSlice';

const LoginTest = () => {
  const user = useSelector((state: UserState) => state.user);

  if (user.id) {
    return (
      <React.Fragment>
        You are logged in as {user.email}
      </React.Fragment>
    )
  } else {
    return (
      <React.Fragment>
        You are logged out
      </React.Fragment>
    )
  }
};

export default LoginTest;