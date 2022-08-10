import React from 'react';

import axios from 'axios';
import { AxiosError } from 'axios';
import { useAsyncEffect } from 'use-async-effect';

import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import { UserConstants } from '../session/types';

type ShowTaskProps = {
  taskId: number;
};

const ShowTaskPage = (props: ShowTaskProps) => {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [statement, setStatement] = React.useState('');
  const [allowedLanguages, setAllowedLanguages] = React.useState('All');
  const [taskType, setTaskType] = React.useState('Batch');
  const [scoreMax, setScoreMax] = React.useState(100);
  const [timeLimit, setTimeLimit] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(1099511627776);
  const [compileTimeLimit, setCompileTimeLimit] = React.useState(10);
  const [compileMemoryLimit, setCompileMemoryLimit] =
    React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [language, setLanguage] = React.useState('en-US');

  async function getCurrentTask() {
    const jwt = localStorage.getItem(UserConstants.JWT);

    if (!jwt) {
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/v1/tasks/view/${props.taskId}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );

      const currentTask = response.data;
      setTitle(currentTask.title);
      setSlug(currentTask.slug);
      setDescription(currentTask.description);
      setStatement(currentTask.statement);
      setAllowedLanguages(currentTask.allowedLanguages);
      setTaskType(currentTask.taskType);
      setScoreMax(currentTask.scoreMax);
      setTimeLimit(currentTask.timeLimit);
      setMemoryLimit(currentTask.memoryLimit);
      setCompileTimeLimit(currentTask.compileTimeLimit);
      setCompileMemoryLimit(currentTask.compileMemoryLimit);
      setSubmissionSizeLimit(currentTask.submissionSizeLimit);
      setLanguage(currentTask.language);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  }

  useAsyncEffect(getCurrentTask, []);

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      <>Title: </>
      <p>{title}</p>

      <br />

      <>Slug: </>
      <p>{slug}</p>

      <br />

      <>Description: </>
      <br />
      <p>{description}</p>

      <br />

      <>Statement: </>
      <br />
      <p>{statement}</p>

      <br />

      <>Allowed languages: </>
      <p>{allowedLanguages}</p>

      <br />

      <>Task type: </>
      <p>{taskType}</p>

      <br />

      <>Maximum score: </>
      <p>{scoreMax}</p>

      <br />

      <>Time limit: </>
      <p>{timeLimit}</p>

      <br />

      <>Memory limit: </>
      <p>{memoryLimit}</p>

      <br />

      <>Compile time limit: </>
      <p>{compileTimeLimit}</p>

      <br />

      <>Compile memory limit: </>
      <p>{compileMemoryLimit}</p>

      <br />

      <>Submission size limit: </>
      <p>{submissionSizeLimit}</p>

      <br />

      <>Language: </>
      <p>{language}</p>

      <br />
    </Main>
  );
};

export const getServerSideProps = async (context: any) => {
  const taskId = context.query.idOrSlug;
  return {
    props: {
      taskId,
    },
  };
};

export default ShowTaskPage;
