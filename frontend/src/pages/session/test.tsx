import React from 'react';
import { useSelector } from 'react-redux';

import { ReduxState } from 'pages/redux/store';

const LoginTest = () => {
  const user = useSelector((state: ReduxState) => state.user);

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