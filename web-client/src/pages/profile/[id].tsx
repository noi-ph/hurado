import React from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { http, HttpResponse } from '../../utils/http';
import { ServerAPI } from '../../types/openapi';

const ViewPage = () => {
  const [user, setUser] = React.useState<ServerAPI['User'] | null>(null);

  const router = useRouter();

  const getUser = async (id: number) => {
    try {
      const response = await http.get(`http://localhost:4000/v1/users/${id}`);

      setUser(response.data.data);
    } catch (e: unknown) {
      if ((e instanceof AxiosError) && e.response) {
        const err: HttpResponse<ServerAPI['UserError']> = e.response;

        if (err.status == 404) {
          alert(`User not found`);
        }
        
      } else {
        console.log(e);

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

        Name: {user.name}
        <br />

        Email: {user.email}
        <br />

        School: {user.school}
        <br />

        Country: {user.country}
        <br />

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