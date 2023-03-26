import React from "react";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";

import Styles from './Login.module.css';
import { set } from 'pages/redux/userSlice';
import { ServerAPI } from "types/openapi";
import { AppConfig } from "utils/AppConfig";
import { http, HttpResponse } from "utils/http";
import { UserConstants } from "utils/types";

type LoginModalProps = {
  id: string;
  signupId: string;
};

const ErrorAreas = {
  Email: Styles.email_error,
  Password: Styles.password_error,
};

export const LoginModal = (props: LoginModalProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const dispatch = useDispatch();

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

  const onLoginClick = async () => {
    clearErrors();

    const payload: ServerAPI['LoginPayload'] = { email, password };

    try {
      const response: HttpResponse<ServerAPI['Login']> = await http.put(`${AppConfig.server}/v1/users/login`, payload);

      localStorage.setItem(UserConstants.JWT, response.data.jwt);
      dispatch(set(response.data.user));
      closeModal();
    } catch (e: unknown) {
      if (e instanceof AxiosError && e.response) {
        const res: HttpResponse<ServerAPI['UserError']> = e.response;

        if (res.data.email) {
          showErrorArea(ErrorAreas.Email, res.data.email);
        }

        if (res.data.password) {
          showErrorArea(ErrorAreas.Password, res.data.password);
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

        <div className={`${Styles.login}`}>Log in</div>

        <div className={`${Styles.email} ${Styles.input}`} >
          <input type='text' placeholder='E-mail address' value={email} onChange={(e) => {setEmail(e.target.value)}} />
        </div>
        <div id={ErrorAreas.Email} />

        <div className={`${Styles.input}`}>
          <input type='password' placeholder='Password' value={password} onChange={(e) => {setPassword(e.target.value)}} />
        </div>
        <div id={ErrorAreas.Password} />

        <button className={`${Styles.button}`} onClick={onLoginClick}>Log in</button>

        {/* TODO implement this */}
        <div className={`${Styles.forgot}`} onClick={() => {alert('Under construction')}}><a>Forgot your password?</a></div>

        <div className={`${Styles.create}`}>
          Don't have an account? <a onClick={() => {
            closeModal();            

            const signup = document.getElementById(props.signupId);
            if (signup) {
              signup.style.display = 'flex';
            }
          }}>Create one!</a>
        </div>
      </div>
    </div>
  );
}