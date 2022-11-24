import React from 'react';

import Styles from './LoggedOutNavBar.module.css';
import { Logo } from 'components/Logo';
import { LoginModal } from 'components/Modals/Login';
import { SignupModal } from 'components/Modals/Signup';

export enum Modals {
  Login = 'login',
  Signup = 'signup',
}

export const showModal = (id: Modals) => {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
  }
};

export const LoggedOutNavBar = () => (
  <React.Fragment>
    <div className={`${Styles.navbar}`}>
      <Logo />
      <div className={`${Styles.navbar_reverse}`}>
        <div onClick={() => showModal(Modals.Login)}>Log in</div>
        <div className={`${Styles.signup}`} onClick={() => showModal(Modals.Signup)}>
          Sign up
        </div>
      </div>
    </div>
    <LoginModal id={Modals.Login} signupId={Modals.Signup} />
    <SignupModal id={Modals.Signup} loginId={Modals.Login} />
  </React.Fragment>
);
