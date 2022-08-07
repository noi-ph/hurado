import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useRouter } from "next/router";

import { Meta } from "../../layout/Meta";
import { Main } from "../../templates/Main";
import { AppConfig } from "../../utils/AppConfig";
import { User, UserConstants } from "../session/types";

type EditPageProps = {
  user: User;
};

const EditPage = (props: EditPageProps) => {
  const user = props.user;

  const [password, enterPassword] = React.useState("");
  const [newEmail, setEmail] = React.useState("");
  const [newUsername, setUsername] = React.useState("");
  const [newPassword, setPassword] = React.useState("");
  const [newPasswordConfirm, setPasswordConfirm] = React.useState("");
  const [newSchool, setSchool] = React.useState("");
  const [newFirstName, setFirstName] = React.useState("");
  const [newLastName, setLastName] = React.useState("");
  const [newCountry, setCountry] = React.useState("");

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
      await axios.post(`http://localhost:4000/v1/auth/change`, {
        id: user.id,
        username: user.username,
        password,
        newEmail,
        newUsername,
        newPassword,
        newPasswordConfirm,
        newSchool,
        newFirstName,
        newLastName,
        newCountry,
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
      <input
        value={newEmail}
        onChange={(event) => setEmail(event.target.value)}
      />
      <br />

      <>New username: </>
      <input
        value={newUsername}
        onChange={(event) => setUsername(event.target.value)}
      />
      <br />

      <>New password: </>
      <input
        value={newPassword}
        onChange={(event) => setPassword(event.target.value)}
      />
      <br />

      <>New password confirmation: </>
      <input
        value={newPasswordConfirm}
        onChange={(event) => setPasswordConfirm(event.target.value)}
      />
      <br />

      <>New school: </>
      <input
        value={newSchool}
        onChange={(event) => setSchool(event.target.value)}
      />
      <br />

      <>New first name: </>
      <input
        value={newFirstName}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <br />

      <>New last name: </>
      <input
        value={newLastName}
        onChange={(event) => setLastName(event.target.value)}
      />
      <br />

      <>New country: </>
      <input
        value={newCountry}
        onChange={(event) => setCountry(event.target.value)}
      />
      <br />

      <>Current password (required): </>
      <input
        value={password}
        onChange={(event) => enterPassword(event.target.value)}
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
