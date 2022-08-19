import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { set, UserState } from '../redux/userSlice';
import { userStateLoader } from '../redux/store';
import { ServerAPI } from '../../types/openapi';
import { http, HttpResponse } from '../../utils/http';

const EditPage = () => {
  const user = useSelector((state: UserState) => state.user);

  const [edited, setEdited] = React.useState(false);

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [country, setCountry] = React.useState('');

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
        firstName,
        lastName,
        country
      });

      dispatch(set(response.data.data));
      setEdited(true);

      alert('Profile has been edited');
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;


        // The console.log stays while the error isn't properly annotated
        console.log(e.response.data);

        // alert(`${status}: ${errorData.errorMessage}`);
      } else {
        console.log(e);

        alert('Something unexpected happened');
      }
    }
  };

  React.useEffect(() => {
    if (edited) {
      userStateLoader.saveState({ user });
    }
  }, [edited])

  return (
    <React.Fragment>
      -----Set changes below-----
      <br />

      E-mail:
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />

      Username:
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <br />

      Password:
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />

      Password confirmation:
      <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
      <br />

      School:
      <input value={school} onChange={(e) => setSchool(e.target.value)} />
      <br />

      First name:
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <br />

      Last name:
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <br />

      Country:
      <input value={country} onChange={(e) => setCountry(e.target.value)} />
      <br />

      <button onClick={onEditClick}>Edit profile</button>
    </React.Fragment>
  );
};

export default EditPage;