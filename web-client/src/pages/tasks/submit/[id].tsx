import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import { http } from '../../../utils/http';

const SubmitToTaskPage = () => {
  const [taskId, setTaskId] = React.useState(0);

  const [fileName, setFileName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [mimeType, setMimeType] = React.useState('text/x-c');
  const [languageCode, setLanguageCode] = React.useState<string | null>('C++');

  const router = useRouter();

  const onSubmissionSubmit = async () => {
    try {
      const submissionPayload = { taskId, createdAt: new Date(), languageCode };

      const submissionResponse = await http.post(`http://localhost:4000/v1/submissions/`, submissionPayload);

      const submission = submissionResponse.data.data;

      // TODO setExtension useState thing
      const fileBlob = new Blob([code], { type: mimeType });
      const fileData = new FormData();
      fileData.append(fileName, fileBlob, fileName);
  
      const fileResponse = await http.post(`http://localhost:4000/v1/files/`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const file = fileResponse.data.data;
  
      const submissionFilePayload = { submissionId: submission.id, fileId: file.id };

      await http.post(`http://localhost:4000/v1/submission-files/`, submissionFilePayload);

      alert('Submission successful');
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
    const runEffect = async () => {
      try {
        const { id } = router.query;

        if (!id) {
          return;
        }

        await http.get(`http://localhost:4000/v1/tasks/${parseInt(id.toString())}`);

        setTaskId(parseInt(id.toString()));
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
      runEffect();
    }
  }, [router.isReady]);

  if (taskId) {
    return (
      <React.Fragment>
        Filename: 
        <input value={fileName} onChange={(e) => setFileName(e.target.value)} />

        Language:
        <select onChange={(e) => {
          const [ mt, lc ] = e.target.value.split('|');
          setMimeType(mt);
          setLanguageCode(lc);
        }}>
          {/* TODO get the languages from server and make a dynamic drowdown */}
          <option value='text/x-c|C++'>C++</option>
          <option value='text/x-script.python|Python3'>Python3</option>
          <option value='plain/text|PlainText'>PlainText</option>
        </select>
        <br />
  
        Code:
        <br />
        <textarea value={code} onChange={(e) => setCode(e.target.value)} />
        <br />
  
        <button onClick={onSubmissionSubmit}>Submit to task</button>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        Task not found
      </React.Fragment>
    )
  }
};

export default SubmitToTaskPage;