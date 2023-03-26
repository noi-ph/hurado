import React from 'react';
import { useSelector } from 'react-redux';

import { ReduxState } from 'pages/redux/store';
import { LoggedOutNavBar, NonAdminNavBar, AdminNavBar } from './NavBars';

export const NavBar = () => {
  const user = useSelector((state: ReduxState) => state.user);
  let navbar: React.ReactNode;

  if (user.id) {
    if (user.isAdmin) {
      navbar = <AdminNavBar />;
    } else {
      navbar = <NonAdminNavBar />;
    }
  } else {
    navbar = <LoggedOutNavBar />;
  }

  return (
    <React.Fragment>
      {navbar}
    </React.Fragment>
  );
};
