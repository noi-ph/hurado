import { AxiosError } from "axios";
import React from "react";
import { ServerAPI } from "types/openapi";
import { AppConfig } from "utils/AppConfig";
import { http, HttpResponse } from "utils/http";

import Styles from './Signup.module.css';

type SignupModalProps = {
  id: string;
  loginId: string;
}

const ErrorAreas = {
  Email: Styles.email_error,
  Username: Styles.username_error,
  Password: Styles.password_error,
  PasswordConfirm: Styles.passwordConfirm_error
}

export const SignupModal = (props: SignupModalProps) => {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');

  const closeModal = () => {
    const modal = document.getElementById(props.id);
    if (modal) {
      modal.style.display = 'none';
    }
  };

  const clearErrors = () => {
    for (const id of Object.values(ErrorAreas)) {
      const area = document.getElementById(id);
      if (area) {
        area.style.display = 'none';
      }
    }
  };

  const showErrorArea = (id: string, value: string) => {
    const area = document.getElementById(id);
    if (area) {
      area.style.display = 'block';
      area.textContent = value;
    }
  };

  const openLoginModal = () => {
    closeModal();            

    const login = document.getElementById(props.loginId);
    if (login) {
      login.style.display = 'flex';
    }
  };

  const onSignupClick = async () => {
    clearErrors();

    const payload: ServerAPI['RegisterPayload'] = {email, username, password, passwordConfirm};

    try {
      await http.post(`${AppConfig.server}/v1/users/register`, payload);

      openLoginModal();
    } catch (e: unknown) {
      if (e instanceof AxiosError && e.response) {
        const res: HttpResponse<ServerAPI['UserError']> = e.response;

        if (res.data.email) {
          showErrorArea(ErrorAreas.Email, res.data.email);
        }

        if (res.data.username) {
          showErrorArea(ErrorAreas.Username, res.data.username);
        }

        if (res.data.password) {
          showErrorArea(ErrorAreas.Password, res.data.password);
        }

        if (res.data.passwordConfirm) {
          showErrorArea(ErrorAreas.PasswordConfirm, res.data.passwordConfirm);
        }
      } else {
        // TODO
      }
    }
  };

  return (
    <div id={props.id}>
      <style jsx>
        {`
          #${props.id} {
            display: none;
            align-items: center;
            justify-content: center;

            position: fixed;
            z-index: 100;

            background-color: rgba(0, 0, 0, 0.5);

            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <div className={`${Styles.modal}`}>
        <button className={`${Styles.close}`} onClick={closeModal}>X</button>

        <div className={`${Styles.signup}`}>Sign up</div>
        
        <div className={`${Styles.email} ${Styles.input}`}>
          <input type='text' placeholder='E-mail address' value={email} onChange={(e) => {setEmail(e.target.value)}} />
        </div>
        <div id={ErrorAreas.Email} />

        <div className={`${Styles.input}`}>
          <input type='text' placeholder='Username' value={username} onChange={(e) => {setUsername(e.target.value)}} />
        </div>
        <div id={ErrorAreas.Username} />
        
        <div className={`${Styles.input}`}>
          <input type='password' placeholder='Password' value={password} onChange={(e) => {setPassword(e.target.value)}} />
        </div>
        <div id={ErrorAreas.Password} />

        <div className={`${Styles.input}`}>
          <input type='password' placeholder='Password confirm' value={passwordConfirm} onChange={(e) => {setPasswordConfirm(e.target.value)}} />
        </div>
        <div id={ErrorAreas.PasswordConfirm} />

        <button className={`${Styles.button}`} onClick={onSignupClick}>Sign up</button>

        <div className={`${Styles.login}`}>
          Already have an account? <a onClick={openLoginModal}>Log in!</a>
        </div>
      </div>
    </div>
  );
};
