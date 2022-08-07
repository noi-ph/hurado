import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useRouter } from "next/router";

import { Main } from "../../templates/Main";
import { Meta } from "../../layout/Meta";
import { AppConfig } from "../../utils/AppConfig";
import { validEmail } from "../../utils/Email";

function validUsername(username: string) {
  const regex = /^([a-z0-9]|[-._](?![-._])){3,20}$/;
  return username.match(regex);
}

const SignUpPage = () => {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password1, setPassword1] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  const router = useRouter();

  function redirectToLoginPage() {
    router.push("/session/login");
  }

  async function onSignUpClick() {
    if (!validEmail(email)) {
      alert("Invalid email!");
      return;
    }
    if (!validUsername(username)) {
      alert("Invalid username!");
      return;
    }
    if (password1 != password2) {
      alert("Passwords don't match!");
      return;
    }
    try {
      const payload = {
        email: email,
        username: username,
        password: password1,
        passwordConfirm: password2,
      };
      await axios.post(`http://localhost:4000/v1/auth/register`, payload);
      alert("Sign up successful!");
      redirectToLoginPage();
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  }

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      <>E-mail: </>
      <input value={email} onChange={(event) => setEmail(event.target.value)} />

      <br />

      <>Username: </>
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />

      <br />

      <>Password: </>
      <input
        value={password1}
        onChange={(event) => setPassword1(event.target.value)}
      />

      <br />

      <>Confim password: </>
      <input
        value={password2}
        onChange={(event) => setPassword2(event.target.value)}
      />

      <br />

      <button onClick={onSignUpClick}>Sign up</button>
    </Main>
  );
};

export default SignUpPage;
