import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { http } from '../../utils/http';

const SignUpPage = () => {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');

  const router = useRouter();

  const onSignUpClick = async () => {
    try {
      await http.post(`http://localhost:4000/v1/auth/register`, { email, username, password, passwordConfirm });

      router.push('/session/login');

      alert('Sign up successful');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const errorData = err.response?.data;

        // The console.log stays while the error isn't properly annotated
        if (status===200) console.log("Success");
        else {
          console.log(errorData);
          alert(Object.entries(errorData));
        }
       
        //console.log(errorData.errors);

        // alert(Object.entries(errorData.errors));

        // let alertMessage: string = '';
        // for (const [key, object] of Object.entries(errorData.errors)) {          
        //   alertMessage.concat(`${key} : ${errorData.errors.get(key)}`);
        // }

        // alert(`${alertMessage}`);
        //alert(`${status}: ${errorData.errorMessage}`);
      } else {
        console.log(err);

        alert('Something unexpected happened');
      }
    }
  };

  return (
    <React.Fragment>
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

      <button onClick={onSignUpClick}>Sign Up</button>
    </React.Fragment>
  );
};

export default SignUpPage;