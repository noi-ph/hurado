import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import { http } from '../../utils/http';

const ShowTaskPageInterceptor = () => {
  const [state, setState] = React.useState('Loading...');

  const router = useRouter();

  const redirectToTaskPage = (id: number, slug: string) => {
    router.push(`/tasks/${id}/${slug}`);
  };

  const getTask = async (idOrSlug: string | number) => {
    try {
      const response = await http.get(`http://localhost:4000/v1/tasks/${idOrSlug}`);
      
      return response.data;
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
      const info = router.query['info'];
      if (info?.length == 1) {
        const idOrSlug = info[0];
        const task = await getTask(idOrSlug);
        if (task) {
          setState("Redirecting...");
          redirectToTaskPage(task.id, task.slug);
        } else {
          setState("Task not found");
        }
      } else if (info?.length == 2) {
        // this shouldn't happen, but handle it anyway
        redirectToTaskPage(parseInt(info[0]), info[1]);
      } else {
        setState("Unable to process URL");
      }
    };

    if (router.isReady) {
      runEffect();
    }
  }, [router.isReady]);

  return (
    <React.Fragment>
      {state}
    </React.Fragment>
  );
};

export default ShowTaskPageInterceptor;