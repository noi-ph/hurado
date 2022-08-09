import React from 'react';

import axios from 'axios';
import { AxiosError } from 'axios';

import { useAsyncEffect } from "use-async-effect";

import { Main } from "../../templates/Main";
import { Meta } from "../../layout/Meta";
import { AppConfig } from "../../utils/AppConfig";
import { Task } from './types';
import { UserConstants } from '../session/types';

type EditTaskProps = {
  taskId: number;
}

const EditTaskPage = (props: EditTaskProps) => {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [statement, setStatement] = React.useState('');
  const [allowedLanguages, setAllowedLanguages] = React.useState('All');
  const [taskType, setTaskType] = React.useState('Batch');
  const [scoreMax, setScoreMax] = React.useState(100);
  const [checker, setChecker] = React.useState('');
  const [timeLimit, setTimeLimit] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(1099511627776);
  const [compileTimeLimit, setCompileTimeLimit] = React.useState(10);
  const [compileMemoryLimit, setcompileMemoryLimit] = React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [validator, setValidator] = React.useState('');
  const [isPublicInArchive, setIsPublicOnArchive] = React.useState(false);
  const [language, setLanguage] = React.useState('en-US');

  async function getCurrentTask() {
    const jwt = localStorage.getItem(UserConstants.JWT);

    if (!jwt) {
      return;
    }

    try {
      const response = await axios.get(`http://localhost:4000/v1/tasks/show/${props.taskId}`, {
        headers: {
          Authorization: jwt,
        },
      });

      const currentTask = response.data;
      setTitle(currentTask.title);
      setSlug(currentTask.slug);
      setDescription(currentTask.description);
      setStatement(currentTask.statement);
      setAllowedLanguages(currentTask.allowedLanguages);
      setTaskType(currentTask.taskType);
      setScoreMax(currentTask.scoreMax);
      setChecker(currentTask.checker);
      setTimeLimit(currentTask.timeLimit);
      setMemoryLimit(currentTask.memoryLimit);
      setCompileTimeLimit(currentTask.compileTimeLimit);
      setSubmissionSizeLimit(currentTask.submissionSizeLimit);
      setValidator(currentTask.validator);
      setIsPublicOnArchive(currentTask.isPublicInArchive);
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

  async function onCreateClick() {
    try {
      const payload = {
        title,
        slug,
        description,
        statement,
        allowedLanguages,
        taskType,
        scoreMax,
        checker,
        timeLimit,
        memoryLimit,
        compileTimeLimit,
        compileMemoryLimit,
        submissionSizeLimit,
        validator,
        isPublicInArchive,
        language,
      }
      const jwt = localStorage.getItem(UserConstants.JWT);

      if (!jwt) {
        return;
      }
      
      await axios.patch(`http://localhost:4000/v1/tasks/${props.taskId}`, payload, {
        headers: {
          Authorization: jwt,
        }
      });
      alert('Task updated successfully');
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
      <>Title: </>
      <input value={title} onChange={(event) => setTitle(event.target.value)} />

      <br />

      <>Slug: </>
      <input value={slug} onChange={(event) => setSlug(event.target.value)} />

      <br />

      <>Description: </>
      <br />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} />

      <br />

      <>Statement: </>
      <br />
      <textarea value={statement} onChange={(event) => setStatement(event.target.value)} />

      <br />

      <>Allowed languages: </>
      <input value={allowedLanguages} onChange={(event) => setAllowedLanguages(event.target.value)} />

      <br />

      <>Task type: </>
      <input value={taskType} onChange={(event) => setTaskType(event.target.value)} />

      <br />

      <>Maximum score: </>
      <input value={scoreMax} onChange={(event) => setScoreMax(parseInt(event.target.value))} />

      <br />

      <>Checker script: </>
      <br />
      <textarea value={checker} onChange={(event) => setChecker(event.target.value)} />

      <br />

      <>Time limit: </>
      <input value={timeLimit} onChange={(event) => setTimeLimit(parseInt(event.target.value))} />

      <br />

      <>Memory limit: </>
      <input value={memoryLimit} onChange={(event) => setMemoryLimit(parseInt(event.target.value))} />

      <br />

      <>Compile time limit: </>
      <input value={compileTimeLimit} onChange={(event) => setCompileTimeLimit(parseInt(event.target.value))} />

      <br />

      <>Compile memory limit: </>
      <input value={compileMemoryLimit} onChange={(event) => setcompileMemoryLimit(parseInt(event.target.value))} />

      <br />

      <>Submission size limit: </>
      <input value={submissionSizeLimit} onChange={(event) => setSubmissionSizeLimit(parseInt(event.target.value))} />

      <br />

      <>Validator: </>
      <br />
      <textarea value={validator} onChange={(event) => setValidator(event.target.value)} />

      <br />

      <>Is public/archived? </>
      <input value={isPublicInArchive?.toString()} onChange={(event) => setIsPublicOnArchive(event.target.value == 'true')} />

      <br />

      <>Language: </>
      <input value={language} onChange={(event) => setLanguage(event.target.value)} />

      <br />

      <button onClick={onCreateClick}>Edit task</button>
    </Main>
  )
}

export const getServerSideProps = async (context: any) => {
  const taskId = parseInt(context.query.id);
  return {
    props: {
      taskId,
    },
  };
}

export default EditTaskPage;