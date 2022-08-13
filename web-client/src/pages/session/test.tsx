import React from "react";

import { useAsyncEffect } from "use-async-effect";

import { Meta } from "../../layout/Meta";
import { Main } from "../../templates/Main";
import { AppConfig } from "../../utils/AppConfig";
import { User, UserConstants } from "./types";
import { http } from "../../utils/http";
import { AxiosResponse } from "axios";
import { ServerAPI } from "../../types/openapi";

const LoginTestInner = () => {
  const getCurrentUser = async () => {
    const userJson = localStorage.getItem(UserConstants.Current);
    const jwt = localStorage.getItem(UserConstants.JWT);

    if (userJson == null || jwt == null) {
      return null;
    }

    const user = JSON.parse(userJson);
    try {
      const response: AxiosResponse<ServerAPI['User_Read']> = await http.get(`http://localhost:4000/v1/users/${user.id}`);
      return response.data;
    } catch (err) {
      return null;
    }
  };

  const [status, setStatus] = React.useState("loading");
  const [user, setUser] = React.useState<User | null>(null);

  const checkIfLoggedInAndUpdateStatus = async () => {
    const userTemp = await getCurrentUser();
    if (userTemp != null) {
      setStatus("logged-in");
      setUser(userTemp as unknown as User);
    } else {
      setStatus("logged-out");
    }
  };

  useAsyncEffect(() => checkIfLoggedInAndUpdateStatus(), []);

  if (status === "logged-in") {
    return <div>You are logged in as {user?.email}</div>;
  }
  if (status === "logged-out") {
    return <div>You are logged out</div>;
  }
  return <div>Loading</div>;
};

const LoginTest = () => {
  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      <LoginTestInner />
    </Main>
  );
};

export default LoginTest;
