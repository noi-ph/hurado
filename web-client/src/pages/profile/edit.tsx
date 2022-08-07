import React from 'react';

import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { User } from '../session/types';

type EditPageProps = {
  user: User;
}

const EditPage = (props: EditPageProps) => {
  const user = props.user;

  // TODO

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      Under construction!
    </Main>
  )
}

export const getServerSideProps = async (context: any) => {
  const user = JSON.parse(context.query.userJson);
  return {
    props: {
      user: user,
    }
  }
}

export default EditPage;