import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useAsyncEffect } from "use-async-effect";

import { Main } from "../../templates/Main";
import { ScriptUploadArea } from "../../templates/Script";
import { Meta } from "../../layout/Meta";
import { AppConfig } from "../../utils/AppConfig";
import { UserConstants } from "../session/types";

type EditTaskProps = {
  taskId: number;
};

const EditTaskPage = (props: EditTaskProps) => {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [statement, setStatement] = React.useState("");
  const [allowedLanguages, setAllowedLanguages] = React.useState("All");
  const [taskType, setTaskType] = React.useState("Batch");
  const [scoreMax, setScoreMax] = React.useState(100);
  const [checkerName, setCheckerName] = React.useState("");
  const [checkerFile, setCheckerFile] = React.useState(null);
  const [checkerLanguageCode, setCheckerLanguageCode] = React.useState("");
  const [checkerRuntimeArgs, setCheckerRuntimeArgs] = React.useState("");
  const [timeLimit, setTimeLimit] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(1099511627776);
  const [compileTimeLimit, setCompileTimeLimit] = React.useState(10);
  const [compileMemoryLimit, setCompileMemoryLimit] =
    React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [validatorName, setValidatorName] = React.useState("");
  const [validatorFile, setValidatorFile] = React.useState(null);
  const [validatorLanguageCode, setValidatorLanguageCode] = React.useState("");
  const [validatorRuntimeArgs, setValidatorRuntimeArgs] = React.useState("");
  const [isPublicInArchive, setIsPublicInArchive] = React.useState(false);
  const [language, setLanguage] = React.useState("en-US");

  const editTask = async (event: any) => {
    event.preventDefault();

    const jwt = localStorage.getItem(UserConstants.JWT);

    if (!jwt) {
      return;
    }

    try {
      let checker = null;
      if (checkerFile) {
        const blob = new Blob([checkerFile]);

        const checkerFileData = new FormData();
        checkerFileData.append(checkerName, blob, checkerName);

        let response = await axios.post(
          `http://localhost:4000/v1/files/upload`,
          checkerFileData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const checkerUploadedFile = response.data;
        const checkerPayload = {
          file: checkerUploadedFile,
          languageCode: checkerLanguageCode,
          runtimeArgs: checkerRuntimeArgs,
        };

        response = await axios.post(
          `http://localhost:4000/v1/scripts/create`,
          checkerPayload
        );

        checker = response.data;
      }

      let validator = null;
      if (validatorFile) {
        const blob = new Blob([validatorFile]);

        const validatorFileData = new FormData();
        validatorFileData.append(validatorName, blob, validatorName);

        let response = await axios.post(
          `http://localhost:4000/v1/files/upload`,
          validatorFileData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const validatorUploadedFile = response.data;
        const validatorPayload = {
          file: validatorUploadedFile,
          languageCode: validatorLanguageCode,
          runtimeArgs: validatorRuntimeArgs,
        };

        response = await axios.post(
          `http://localhost:4000/v1/scripts/create`,
          validatorPayload
        );

        validator = response.data;
      }

      const taskPayload = {
        title,
        slug,
        description,
        statement,
        allowedLanguages,
        taskType,
        scoreMax,
        checkerId: checker.id,
        timeLimit,
        memoryLimit,
        compileTimeLimit,
        compileMemoryLimit,
        submissionSizeLimit,
        validatorId: validator.id,
        isPublicInArchive,
        language,
      };

      await axios.post(`http://localhost:4000/v1/tasks`, taskPayload, {
        headers: {
          Authorization: jwt,
        },
      });

      alert("Task edited successfully");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  };

  const getCurrentTask = async () => {
    const jwt = localStorage.getItem(UserConstants.JWT);

    if (!jwt) {
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/v1/tasks/show/${props.taskId}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );

      // TODO incorporate setChecker's and setValidator's

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
      setSubmissionSizeLimit(currentTask.submissionSizeLimit);
      setIsPublicInArchive(currentTask.isPublicInArchive);
      setLanguage(currentTask.language);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  };

  useAsyncEffect(getCurrentTask, []);

  return (
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      <form onSubmit={editTask}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <br />

        <label>
          Slug:
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>

        <br />

        <label>
          Description:
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <br />

        <label>
          Statement:
          <br />
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </label>

        <br />

        <label>
          Allowed languages:
          <input
            type="text"
            value={allowedLanguages}
            onChange={(e) => setAllowedLanguages(e.target.value)}
          />
        </label>

        <br />

        <label>
          Task type:
          <input
            type="text"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          />
        </label>

        <br />

        <label>
          Maximum score:
          <input
            type="text"
            value={scoreMax}
            onChange={(e) => setScoreMax(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Checker
          <br />
          <ScriptUploadArea
            forName={{ name: checkerName, setName: setCheckerName }}
            forFile={{ file: checkerFile, setFile: setCheckerFile }}
            forLanguageCode={{
              languageCode: checkerLanguageCode,
              setLanguageCode: setCheckerLanguageCode,
            }}
            forRuntimeArgs={{
              runtimeArgs: checkerRuntimeArgs,
              setRuntimeArgs: setCheckerRuntimeArgs,
            }}
          />
        </label>

        <br />

        <label>
          Time limit:
          <input
            type="text"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Memory limit:
          <input
            type="text"
            value={memoryLimit}
            onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Compile time limit:
          <input
            type="text"
            value={compileTimeLimit}
            onChange={(e) => setCompileTimeLimit(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Compile memory limit:
          <input
            type="text"
            value={compileMemoryLimit}
            onChange={(e) => setCompileMemoryLimit(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Submissions size limit:
          <input
            type="text"
            value={submissionSizeLimit}
            onChange={(e) => setSubmissionSizeLimit(parseInt(e.target.value))}
          />
        </label>

        <br />

        <label>
          Validator
          <br />
          <ScriptUploadArea
            forName={{ name: validatorName, setName: setValidatorName }}
            forFile={{ file: validatorFile, setFile: setValidatorFile }}
            forLanguageCode={{
              languageCode: validatorLanguageCode,
              setLanguageCode: setValidatorLanguageCode,
            }}
            forRuntimeArgs={{
              runtimeArgs: validatorRuntimeArgs,
              setRuntimeArgs: setValidatorRuntimeArgs,
            }}
          />
        </label>

        <br />

        <label>
          Is public/in archive?
          <input
            type="text"
            value={isPublicInArchive.toString()}
            onChange={(e) => setIsPublicInArchive(e.target.value === "true")}
          />
        </label>

        <br />

        <label>
          Language:
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </label>

        <br />

        <input type="submit" value="Edit task" />
      </form>
    </Main>
  );
};

export const getServerSideProps = async (context: any) => {
  const taskId = parseInt(context.query.id);
  return {
    props: {
      taskId,
    },
  };
};

export default EditTaskPage;
