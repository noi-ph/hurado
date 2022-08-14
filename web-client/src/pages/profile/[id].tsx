import React from 'react';

import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import { http } from '../../utils/http';
import { ServerAPI } from '../../types/openapi';

const ViewPage = () => {
  const [user, setUser] = React.useState<ServerAPI['User'] | null>(null);

  const router = useRouter();

  const getUser = async (id: number) => {
    try {
      const response = await http.get(`http://localhost:4000/v1/users/${id}`);

      setUser(response.data.data);
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
    if (router.isReady) {
      const { id } = router.query;
      if (id) {
        getUser(parseInt(id.toString()));
      }
    }
  }, [router.isReady]);

  if (user) {
    return (
      <React.Fragment>
        Username: {user.username}
        <br />

        School: {user.school}
        <br />

        Name: {user.firstName} {user.lastName}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        User not found
      </React.Fragment>
    )
  }
};

export default ViewPage;