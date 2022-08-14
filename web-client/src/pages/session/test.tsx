import React from 'react';
import { useSelector } from 'react-redux';

const LoginTest = () => {
  const user = useSelector((state: any) => state.user);

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