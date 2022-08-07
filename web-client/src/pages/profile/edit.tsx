import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useRouter } from "next/router";

import { Meta } from "../../layout/Meta";
import { Main } from "../../templates/Main";
import { AppConfig } from "../../utils/AppConfig";
import { User } from "../session/types";

type EditPageProps = {
  user: User;
};

const EditPage = (props: EditPageProps) => {
  const user = props.user;

  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [school, setSchool] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [country, setCountry] = React.useState("");

  const router = useRouter();

  function redirectToViewPage() {
    const userJson = JSON.stringify(user);
    router.push(
      {
        pathname: "/profile/view",
        query: {
          userJson,
        },
      },
      "/profile/view"
    );
  }

  async function onEditClick() {
    try {
      await axios.post(`http://localhost:4000/v1/users/change`, {
        id: user.id,
        email,
        username,
        password,
        passwordConfirm,
        school,
        firstName,
        lastName,
        country,
      });
      alert("Changes have been executed!");
      redirectToViewPage();
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
      <>New e-mail: </>
      <input value={email} onChange={(event) => setEmail(event.target.value)} />
      <br />

      <>New username: </>
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <br />

      <>New password: </>
      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <br />

      <>New password confirmation: </>
      <input
        value={passwordConfirm}
        onChange={(event) => setPasswordConfirm(event.target.value)}
      />
      <br />

      <>New school: </>
      <input
        value={school}
        onChange={(event) => setSchool(event.target.value)}
      />
      <br />

      <>New first name: </>
      <input
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <br />

      <>New last name: </>
      <input
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
      />
      <br />

      <>New country: </>
      <input
        value={country}
        onChange={(event) => setCountry(event.target.value)}
      />
      <br />

      <button onClick={onEditClick}>Change</button>
    </Main>
  );
};

export const getServerSideProps = async (context: any) => {
  const user = JSON.parse(context.query.userJson);
  return {
    props: {
      user: user,
    },
  };
};

export default EditPage;
