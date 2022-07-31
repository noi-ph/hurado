import React from 'react';

const doStuff = (props: any) => {
  alert(`Everyone, ${props.email}'s password is ${props.password}!!11!!`);
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
