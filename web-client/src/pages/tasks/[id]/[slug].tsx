import React from "react";

import axios from "axios";
import { AxiosError } from "axios";
import { useAsyncEffect } from "use-async-effect";

import { useRouter } from "next/router";

import { Meta } from "../../../layout/Meta";
import { UserConstants } from "../../session/types";
import { Main } from "../../../templates/Main";
import { AppConfig } from "../../../utils/AppConfig";

// TODO: make it so that admins get more details

const ShowTaskPage = () => {
  const router = useRouter();

  const [slug, setSlug] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [statement, setStatement] = React.useState("");
  const [allowedLanguages, setAllowedLanguages] = React.useState("All");
  const [taskType, setTaskType] = React.useState("Batch");
  const [scoreMax, setScoreMax] = React.useState(100);
  const [timeLimit, setTimeLimit] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(1099511627776);
  const [compileTimeLimit, setCompileTimeLimit] = React.useState(10);
  const [compileMemoryLimit, setCompileMemoryLimit] =
    React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [language, setLanguage] = React.useState("en-US");

  const getTask = async (idOrSlug: string) => {
    let jwt = localStorage.getItem(UserConstants.JWT);
    jwt = jwt ? jwt : "";

    try {
      const response = await axios.get(
        `http://localhost:4000/v1/tasks/view/${idOrSlug}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );

      const task = response.data;
      return task;
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  };

  useAsyncEffect(async () => {
    if (!router.isReady) {
      return;
    }
    const { id, slug } = router.query;
    if (id && slug) {
      const task = await getTask(id.toString());
      setTitle(task.title);
      setSlug(task.slug);
      setDescription(task.description);
      setStatement(task.statement);
      setAllowedLanguages(task.allowedLanguages);
      setTaskType(task.taskType);
      setScoreMax(task.scoreMax);
      setTimeLimit(task.timeLimit);
      setMemoryLimit(task.memoryLimit);
      setCompileTimeLimit(task.compileTimeLimit);
      setCompileMemoryLimit(task.compileMemoryLimit);
      setSubmissionSizeLimit(task.submissionSizeLimit);
      setLanguage(task.language);
    }
  }, [router.isReady]);

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

export default ShowTaskPage;
