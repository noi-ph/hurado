import React from 'react';
import { useSelector } from 'react-redux';

import { ReduxState } from 'redux/store';
import { AdminNavBar } from 'components/NavBar/Admin';
import { LoggedOutNavBar } from 'components/NavBar/LoggedOut';
import { NonAdminNavBar } from 'components/NavBar/NonAdmin';

export const NavBar = () => {
  const user = useSelector((state: ReduxState) => state.user);
  const [navbar, setNavbar] = React.useState(<LoggedOutNavBar />);

  React.useEffect(() => {
    if (user.id) {
      if (user.isAdmin) {
        setNavbar(<AdminNavBar />);
      } else {
        setNavbar(<NonAdminNavBar />);
      }
    }
  }, [user.id]);

  return navbar;
};