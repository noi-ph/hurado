import React from 'react';
import axios, { AxiosError } from 'axios';

const doStuff = async (args: any) => {
  try {
    const response = await axios.post(`http://localhost:4000/v1/auth/login`, {
      email: args.email,
      password: args.password,
    });
    // TODO
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      alert(err.message);
    } else {
      alert('An unknown error occured');
      console.log(err);
    }
  }
};

const LoginPage = () => {
  const array = React.useState({
    email: '',
    password: '',
  });
  const [login, setLogin] = array;

  return (
    <div>
      <>E-mail:</>
      <input
        value={login.email}
        onChange={(event) =>
          setLogin({
            email: event.target.value,
            password: login.password,
          })
        }
      />

      <>Password:</>
      <input
        value={login.password}
        onChange={(event) =>
          setLogin({
            email: login.email,
            password: event.target.value,
          })
        }
      />

      <button onClick={() => doStuff(login)}>Log-in</button>
    </div>
  );
};

export { LoginPage };
