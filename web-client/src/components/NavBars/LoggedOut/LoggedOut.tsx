import React from 'react';

import Styles from './LoggedOut.module.css';
import { Logo } from 'components/Logo/Logo';
import { LoginModal } from 'components/Modals/Login/Login';
import { SignupModal } from 'components/Modals/Signup/Signup';

enum Modals {
  Login = 'login',
  Signup = 'signup',
};

export const LoggedOutNavBar = () => {
  const showModal = (id: Modals) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'flex';
    }
  };

  return (
    <React.Fragment>
      <div className={`${Styles.navbar}`}>
        <Logo />
        <div className={`${Styles.navbar_reverse}`}>
          <div onClick={() => showModal(Modals.Login)}>
            Log in
          </div>
          <div className={`${Styles.signup}`} onClick={() => showModal(Modals.Signup)}>
            Sign up
          </div>
        </div>
      </div>
      <LoginModal id={Modals.Login} signupId={Modals.Signup} />
      <SignupModal id={Modals.Signup} loginId={Modals.Login} />
    </React.Fragment>
  );
};
