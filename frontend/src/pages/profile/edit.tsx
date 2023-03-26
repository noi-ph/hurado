import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AxiosError } from 'axios';

import { set } from 'pages/redux/userSlice';
import { ReduxState } from 'pages/redux/store';
import { userStateLoader } from 'pages/redux/userSlice';
import { ServerAPI } from 'types/openapi';
import { http, HttpResponse } from 'utils/http';

const EditPage = () => {
  const user = useSelector((state: ReduxState) => state.user);

  const [edited, setEdited] = React.useState(false);

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [name, setName] = React.useState('');
  const [country, setCountry] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordConfirmError, setPasswordConfirmError] = React.useState('');
  const [countryError, setCountryError] = React.useState('');

  const dispatch = useDispatch();

  const onEditClick = async () => {
    try {
      setEdited(false);

      const response = await http.patch(`http://localhost:4000/v1/users/${user.id}`, {
        email,
        username,
        password,
        passwordConfirm,
        school,
        name,
        country
      });

      dispatch(set(response.data));
      setEdited(true);

      alert('Profile has been edited');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        if(err.data.email) {
          setEmailError(err.data.email);
        } else setEmailError('');

        if(err.data.username) {
          setUsernameError(err.data.username);
        } else setUsernameError('');

        if(err.data.password) {
          setPasswordError(err.data.password);
        } else setPasswordError('');

        if(err.data.passwordConfirm) {
          setPasswordConfirmError(err.data.passwordConfirm);
        } else setPasswordConfirmError('');

        if(err.data.country) {
          setCountryError(err.data.country);
        } else setCountryError('');

        if (err.status == 500) {
          alert(`${err.status}: Internal server error`);
        }

        console.log(err.data);
      } else {
        console.log(e);

        alert('Something unexpected happened');
      }
    }
  };

  React.useEffect(() => {
    if (edited) {
      userStateLoader.saveState(user);
    }
  }, [edited])

  return (
    <React.Fragment>
      -----Set changes below-----
      <br />

      E-mail:
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <p>{emailError}</p>
      <br />

      Username:
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <p>{usernameError}</p>
      <br />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <p>{passwordError}</p>
      <br />

      Password confirmation:
      <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <p>{passwordConfirmError}</p>
      <br />

      School:
      <input value={school} onChange={(e) => setSchool(e.target.value)} />
      <br />

      Name:
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <br />

      Country:
      <input value={country} onChange={(e) => setCountry(e.target.value)} />
      <br />
      <p>{countryError}</p>

      <button onClick={onEditClick}>Edit profile</button>
    </React.Fragment>
  );
};

export default EditPage;