import React, { useState } from 'react';
import { useRouter } from 'next/router';

import { http } from '../../../utils/http';
import { AdminNavBar } from '../../../components/AdminNavBar';
import { TaskEditor } from '../../../components/TaskEditor/TaskEditor';
import { Task } from '../../../components/TaskEditor/types';

const EditTaskPage = () => {
  const [task, setTask] = useState<Task | null>(null);
  const router = useRouter();
  React.useEffect(() => {
    const taskId = router.query.id;
    if (taskId == null) {
      return;
    }
    http.get(`http://localhost:4000/v1/tasks/${taskId}/all-details`)
      .then((response) => {
        const responseTask: Task = response.data;
        setTask(responseTask);
      });
  }, [router.query.id]);

  return (
    <div>
      <AdminNavBar/>
      { task != null
        ? <TaskEditor task={task}/>
        : 'Loading'}
    </div>
  );
};

export default EditTaskPage;
