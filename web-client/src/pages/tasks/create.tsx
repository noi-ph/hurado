import React from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';

import { ScriptUploadArea } from '../../components/Script';
import { http } from '../../utils/http';

const CreateTaskPage = () => {
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
  const [compileMemoryLimit, setCompileMemoryLimit] = React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [validatorName, setValidatorName] = React.useState("");
  const [validatorFile, setValidatorFile] = React.useState(null);
  const [validatorLanguageCode, setValidatorLanguageCode] = React.useState("");
  const [validatorRuntimeArgs, setValidatorRuntimeArgs] = React.useState("");
  const [isPublicInArchive, setIsPublicInArchive] = React.useState(false);
  const [language, setLanguage] = React.useState("en-US");

  const CheckerContext = React.createContext({
    name: checkerName,
    setName: setCheckerName,
    file: checkerFile,
    setFile: setCheckerFile,
    languageCode: checkerLanguageCode,
    setLanguageCode: setCheckerLanguageCode,
    runtimeArgs: checkerRuntimeArgs,
    setRuntimeArgs: setCheckerRuntimeArgs
  });
  const ValidatorContext = React.createContext({
    name: validatorName,
    setName: setValidatorName,
    file: validatorFile,
    setFile: setValidatorFile,
    languageCode: validatorLanguageCode,
    setLanguageCode: setValidatorLanguageCode,
    runtimeArgs: validatorRuntimeArgs,
    setRuntimeArgs: setValidatorRuntimeArgs
  });

  const router = useRouter();

  const createTask = async (e: any) => {
    e.preventDefault();  // Prevents automatic page reloading

    if (!checkerFile || !validatorFile) {
      alert('Please select a file');
      return;
    }

    try {
      const checkerBlob = new Blob([checkerFile]);
      const checkerFileData = new FormData();
      checkerFileData.append(checkerName, checkerBlob, checkerName);

      const checkerFileResponse = await http.post(`http://localhost:4000/v1/files/`, checkerFileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const checkerUploadedFile = checkerFileResponse.data.data;
      const checkerPayload = {
        file: checkerUploadedFile,
        languageCode: checkerLanguageCode,
        runtimeArgs: checkerRuntimeArgs,
      };

      const checkerResponse = await http.post(`http://localhost:4000/v1/scripts`, checkerPayload);

      const checker = checkerResponse.data.data;

      const validatorBlob = new Blob([validatorFile]);
      const validatorFileData = new FormData();
      validatorFileData.append(validatorName, validatorBlob, validatorName);

      const validatorFileResponse = await http.post(`http://localhost:4000/v1/files/`, validatorFileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const validatorUploadedFile = validatorFileResponse.data.data;
      const validatorPayload = {
        file: validatorUploadedFile,
        languageCode: validatorLanguageCode,
        runtimeArgs: validatorRuntimeArgs,
      };

      const validatorResponse = await http.post(`http://localhost:4000/v1/scripts`, validatorPayload);

      const validator = validatorResponse.data.data;

      const taskPayload = {
        title,
        slug,
        description,
        statement,
        allowedLanguages,
        taskType,
        scoreMax,
        checkerScriptId: checker.id,
        timeLimit,
        memoryLimit,
        compileTimeLimit,
        compileMemoryLimit,
        submissionSizeLimit,
        validatorScriptId: validator.id,
        isPublicInArchive,
        language,
      };

      const taskResponse = await http.post(`http://localhost:4000/v1/tasks`, taskPayload);

      const task = taskResponse.data.data;

      alert('Task created successfully');

      router.push(`/tasks/edit/${task.id}`);
    } catch (err: unknown) {  
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const errorData = err.response?.data;

        // The console.log stays while the error isn't properly annotated
        console.log(errorData);

        alert(`${status}: ${errorData.errorMessage}`);
      } else {
        console.log(err);

        alert('Something unexpected happened');
      }
    }
  };

  return (
    <form>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <br />

      <label>
        Slug:
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </label>
      <br />

      <label>
        Description:
        <br />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <br />

      <label>
        Statement:
        <br />
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} />
      </label>
      <br />

      <label>
        Allowed languages:
        <input type="text" value={allowedLanguages} onChange={(e) => setAllowedLanguages(e.target.value)} />
      </label>
      <br />

      <label>
        Task type:
        <input type="text" value={taskType} onChange={(e) => setTaskType(e.target.value)} />
      </label>
      <br />

      <label>
        Maximum score:
        <input type="text" value={scoreMax} onChange={(e) => setScoreMax(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        -----Checker-----
        <br />
        <ScriptUploadArea Context={CheckerContext} />
        <br />
        -----------------
      </label>
      <br />

      <label>
        Time limit:
        <input type="text" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        Memory limit:
        <input type="text" value={memoryLimit} onChange={(e) => setMemoryLimit(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        Compile time limit:
        <input type="text" value={compileTimeLimit} onChange={(e) => setCompileTimeLimit(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        Compile memory limit:
        <input type="text" value={compileMemoryLimit} onChange={(e) => setCompileMemoryLimit(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        Submissions size limit:
        <input type="text" value={submissionSizeLimit} onChange={(e) => setSubmissionSizeLimit(parseInt(e.target.value))} />
      </label>
      <br />

      <label>
        ----Validator----
        <br />
        <ScriptUploadArea Context={ValidatorContext} />
        <br />
        -----------------
      </label> 
      <br />

      <label>
        Is public/in archive?
        <input type="text" value={isPublicInArchive.toString()} onChange={(e) => setIsPublicInArchive(e.target.value === "true")} />
      </label>
      <br />

      <label>
        Language:
        <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)}/>
      </label>
      <br />

      <button onClick={createTask}>Create task</button>
    </form>
  );
};

export default CreateTaskPage;