import React from 'react';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ReduxState } from 'pages/redux/store';
import Styles from './AdminNavBar.module.css';


export const AdminNavBar = () => {
  const user = useSelector((state: ReduxState) => state.user);

  return (
    <div className={`${Styles.navbar} flex`}>
      <Link className={`${Styles.brand}`} href='/'>
        TARSIER ADMIN
      </Link>
      <div className={`${Styles.welcome} flex-auto text-center`}>
        Welcome {user.username ?? 'Heisenberg'}!
      </div>
      <Link href='/session/logout' passHref={true}>
        <a className={Styles.logout}>
          Log out
        </a>
      </Link>
    </div>
  );
};
