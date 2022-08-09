import React from 'react';

import { Main } from "../../templates/Main";
import { Meta } from "../../layout/Meta";
import { AppConfig } from "../../utils/AppConfig";

const CreateTaskPage = () => {
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

export default CreateTaskPage;