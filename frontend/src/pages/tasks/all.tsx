import React from 'react';
import { AxiosError } from 'axios';

import { TaskViewer } from '../../components/Task';
import { http } from '../../utils/http';

const TasksPage = () => {
  const [tasks, setTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const getTasks = async() => {
      try {
        const response = await http.get('http://localhost:4000/v1/tasks');

        setTasks(response.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          // The console.log stays while the error isn't properly annotated
          console.log(err);
        } else {
          console.log(err);

          alert('Something unexpected happened');
        }
      }
    };

    getTasks();
  }, []);

  const taskComponents = tasks.map((i) => (
    <TaskViewer id={i.id} title={i.title} slug={i.slug} />
  ));
  console.log(taskComponents);

  return (
    <React.Fragment>
      {taskComponents}
    </React.Fragment>
  );
};

export default TasksPage;