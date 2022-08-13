import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useRouter } from "next/router";

import { Meta } from "../../../layout/Meta";
import { Main } from "../../../templates/Main";
import { AppConfig } from "../../../utils/AppConfig";

import { Task } from "../../tasks/types";
import { UserConstants } from "../../session/types";

const ShowTaskPageInner = () => {
  const router = useRouter();

  const [state, setState] = React.useState("Loading...");

  const [task, setTask] = React.useState<Task | null>(null);

  const getTask = async (idOrSlug: string | number) => {
    let jwt = localStorage.getItem(UserConstants.JWT);
    jwt = jwt ? jwt : "";

    try {
      const response = await axios.get(
        `http://localhost:4000/v1/tasks/${idOrSlug}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );

      return response.data.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errors = err.response?.data.errors;
        if (errors) {
          console.log(errors);
        }
      } else {
        alert("Something unexpected happened");
        console.log(err);
      }
    }
  };

  React.useEffect(() => {
    const runEffect = async () => {
      const { id, slug } = router.query;
      if (id && slug) {
        const taskId = await getTask(parseInt(id.toString()));
        const taskSlug = await getTask(slug.toString());
        if (taskId?.id === taskSlug?.id) {
          setTask(taskId);
        } else {
          setState(
            `Either id '${id}' or slug '${slug}' does not correspond to a task`
          );
        }
      }
    };
    if (router.isReady) {
      runEffect();
    }
  }, [router.isReady]);

  if (task) {
    return (
      <>
        {task.id}: {task.title} ({task.slug})
        <br />
        {task.language}
        <br />
        {task.description}
        <br />
        {task.statement}
        <br />
        Accepts: {task.allowedLanguages}
        <br />
        Task type: {task.taskType}
        <br />
        Maximum score: {task.scoreMax}
        <br />
        Time limit: {task.timeLimit}s
        <br />
        Memory limit: {task.memoryLimit}
        <br />
        Compile time limit: {task.compileTimeLimit}s
        <br />
        Compile memory limit: {task.compileMemoryLimit}
        <br />
        Submission size limit: {task.submissionSizeLimit}
        <br />
        Is public | In archive? {task.isPublicInArchive.toString()}
      </>
    );
  } else {
    return <>{state}</>;
  }
};

const ShowTaskPage = () => (
  <Main
    meta={<Meta title={AppConfig.title} description={AppConfig.description} />}
  >
    <ShowTaskPageInner />
  </Main>
);

export default ShowTaskPage;
