import React from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';

import { ScriptUploadArea } from '../../../components/Script';
import { http } from '../../../utils/http';
import { AdminNavBar } from '../../../components/AdminNavBar';

const EditTaskPage = () => {
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [statement, setStatement] = React.useState('');
  const [allowedLanguages, setAllowedLanguages] = React.useState('All');
  const [taskType, setTaskType] = React.useState('Batch');
  const [scoreMax, setScoreMax] = React.useState(100);
  const [checkerName, setCheckerName] = React.useState('');
  const [checkerFile, setCheckerFile] = React.useState(null);
  const [checkerLanguageCode, setCheckerLanguageCode] = React.useState('');
  const [checkerRuntimeArgs, setCheckerRuntimeArgs] = React.useState('');
  const [timeLimit, setTimeLimit] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(1099511627776);
  const [compileTimeLimit, setCompileTimeLimit] = React.useState(10);
  const [compileMemoryLimit, setCompileMemoryLimit] = React.useState(1099511627776);
  const [submissionSizeLimit, setSubmissionSizeLimit] = React.useState(32768);
  const [validatorName, setValidatorName] = React.useState('');
  const [validatorFile, setValidatorFile] = React.useState(null);
  const [validatorLanguageCode, setValidatorLanguageCode] = React.useState('');
  const [validatorRuntimeArgs, setValidatorRuntimeArgs] = React.useState('');
  const [isPublicInArchive, setIsPublicInArchive] = React.useState(false);
  const [language, setLanguage] = React.useState('en-US');

  const CheckerContext = React.createContext({
    checkerName,
    setCheckerName,
    checkerFile,
    setCheckerFile,
    checkerLanguageCode,
    setCheckerLanguageCode,
    checkerRuntimeArgs,
    setCheckerRuntimeArgs,
  });
  const ValidatorContext = React.createContext({
    validatorName,
    setValidatorName,
    validatorFile,
    setValidatorFile,
    validatorLanguageCode,
    setValidatorLanguageCode,
    validatorRuntimeArgs,
    setValidatorRuntimeArgs,
  });

  const router = useRouter();

  const editTask = async(e: any) => {
    e.preventDefault(); // Prevents automatic page reloading

    try {
      let checker = null;
      let checkerScriptId = null;

      if (checkerFile) {
        const checkerBlob = new Blob([checkerFile]);
        const checkerFileData = new FormData();
        checkerFileData.append(checkerName, checkerBlob, checkerName);

        const checkerFileResponse = await http.post('http://localhost:4000/v1/files/', checkerFileData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const checkerUploadedFile = checkerFileResponse.data;
        const checkerPayload = {
          file: checkerUploadedFile,
          languageCode: checkerLanguageCode,
          runtimeArgs: checkerRuntimeArgs,
        };

        const checkerResponse = await http.post('http://localhost:4000/v1/scripts', checkerPayload);

        checker = checkerResponse.data;
        checkerScriptId = checker.id;
      }

      let validator = null;
      let validatorScriptId = null;

      if (validatorFile) {
        const validatorBlob = new Blob([validatorFile]);
        const validatorFileData = new FormData();
        validatorFileData.append(validatorName, validatorBlob, validatorName);

        const validatorFileResponse = await http.post('http://localhost:4000/v1/files/', validatorFileData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const validatorUploadedFile = validatorFileResponse.data;
        const validatorPayload = {
          file: validatorUploadedFile,
          languageCode: validatorLanguageCode,
          runtimeArgs: validatorRuntimeArgs,
        };

        const validatorResponse = await http.post('http://localhost:4000/v1/scripts', validatorPayload);

        validator = validatorResponse.data;
        validatorScriptId = validator.id;
      }

      const taskPayload = {
        title,
        slug,
        description,
        statement,
        allowedLanguages,
        taskType,
        scoreMax,
        checkerScriptId,
        timeLimit,
        memoryLimit,
        compileTimeLimit,
        compileMemoryLimit,
        submissionSizeLimit,
        validatorScriptId,
        isPublicInArchive,
        language,
      };

      await http.patch(`http://localhost:4000/v1/tasks/${id}`, taskPayload);

      alert('Task edited successfully');
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

  React.useEffect(() => {
    const getCurrentTask = async() => {
      const { id } = router.query;

      if (!id) {
        return;
      }

      try {
        const response = await http.get(`http://localhost:4000/v1/tasks/${id}`);

        const task = response.data.data;

        // TODO incorporate setChecker's and setValidator's

        setId(parseInt(task.id));
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
        setSubmissionSizeLimit(task.submissionSizeLimit);
        setIsPublicInArchive(task.isPublicInArchive);
        setLanguage(task.language);

        // TODO add validation for ownership so that the below could be included
        // TODO add GET endpoints to script and file

        // const checker = (await http.get(`http://localhost:4000/v1/scripts/${task.checkerScriptId}`)).data;
        // const thisCheckerFile = (await http.get(`http://localhost:4000/v1/files/${checker.fileId}`)).data;
        // setCheckerFile(thisCheckerFile.file);
        // setCheckerLanguageCode(checker.languageCode);
        // setCheckerName(thisCheckerFile.name);
        // setCheckerRuntimeArgs(checker.runtimeArgs);

        // const validator = (await http.get(`http://localhost:4000/v1/scripts/${task.validatorScriptId}`)).data;
        // const thisValidatorFile = (await http.get(`http://localhost:4000/v1/files/${validator.fileId}`)).data;
        // setValidatorFile(thisValidatorFile.file);
        // setValidatorLanguageCode(validator.languageCode);
        // setValidatorName(thisValidatorFile.name);
        // setValidatorRuntimeArgs(validator.runtimeArgs);
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

    if (router.isReady) {
      getCurrentTask();
    }
  }, [router.isReady]);

  return (
    <>
      <AdminNavBar/>
      Hello fren!
    </>
  );
};

export default EditTaskPage;