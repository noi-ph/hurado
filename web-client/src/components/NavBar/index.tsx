import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import { ReduxState } from 'redux/store';
import { AdminNavBar } from 'components/NavBar/Admin';
import { LoggedOutNavBar } from 'components/NavBar/LoggedOut';
import { LoggedInNavBar } from 'components/NavBar/LoggedIn';

export const NavBar = () => {
  const user = useSelector((state: ReduxState) => state.user);
  const [navbar, setNavbar] = React.useState(<LoggedOutNavBar />);

  const router = useRouter();
  
  React.useEffect(() => {
    if (user.id) {
      if (router.pathname == '/tasks/edit/[id]') {
        setNavbar(<AdminNavBar />);
      } else {
        setNavbar(<LoggedInNavBar />);
      }
    }
  }, [user.id]);

  return navbar;
};