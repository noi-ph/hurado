import React from "react";

import { Meta } from "../../layout/Meta";
import { Main } from "../../templates/Main";
import { AppConfig } from "../../utils/AppConfig";
import { User } from "../session/types";

type ViewPageProps = {
  user: User;
};

const ViewPage = (props: ViewPageProps) => {
  const user = props.user;
  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      Username: {user?.username}
      <br />
      School: {user?.school}
      <br />
      Name: {user?.firstName} {user?.lastName}
    </Main>
  );
};

export const getServerSideProps = async (context: any) => {
  // TODO make user variable a global
  const user = JSON.parse(context.query.userJson);
  return {
    props: {
      user: user,
    },
  };
};

export default ViewPage;
