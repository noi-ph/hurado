import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import { ServerAPI } from '../../../types/openapi';
import { http } from '../../../utils/http';

const ShowTaskPage = () => {
  const [state, setState] = React.useState('Loading...');
  const [task, setTask] = React.useState<ServerAPI['TaskRead'] | null>(null);

  const router = useRouter();

  const getTask = async (idOrSlug: string | number) => {
    try {
      const response = await http.get(`http://localhost:4000/v1/tasks/${idOrSlug}`);
      
      return response.data.data;
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
      const { id, slug } = router.query;
      if (id && slug) {
        const task1 = await getTask(parseInt(id.toString()));
        const task2 = await getTask(slug.toString());
        if (task1?.id === task2?.id) {
          setTask(task1);
        } else {
          setState(`Either '${id}' or '${slug}' does not corresponse to a task`);
        }
      } 
    };

    if (router.isReady) {
      runEffect();
    }
  }, [router.isReady]);

  if (task) {
    return (
      <React.Fragment>
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
        <br />

        <button onClick={() => router.push(`/tasks/submit/${task.id}`)}>Submit to task</button>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        {state}
      </React.Fragment>
    );
  }
};

export default ShowTaskPage;