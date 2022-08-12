import React from "react";

import axios from "axios";
import { AxiosError } from "axios";

import { useRouter } from "next/router";

import { Meta } from "../../layout/Meta";
import { UserConstants } from "../session/types";
import { Main } from "../../templates/Main";
import { AppConfig } from "../../utils/AppConfig";

const ShowTaskPageInterceptor = () => {
  const router = useRouter();

  const [state, setState] = React.useState("Loading...");

  const redirectToTaskPage = (id: number, slug: string) => {
    console.log("mlem");
    console.log(id);
    router.push(`/tasks/${id}/${slug}`);
  };

  const getTask = async (idOrSlug: string) => {
    let jwt = localStorage.getItem(UserConstants.JWT);
    jwt = jwt ? jwt : "";

    try {
      const response = await axios.get(
        `http://localhost:4000/v1/tasks/view/${idOrSlug}`,
        {
          headers: {
            Authorization: jwt,
          },
        }
      );

      const task = response.data;
      return task;
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.errorMessage);
      } else {
        alert(err);
      }
    }
  };

  React.useEffect(() => {
    const runEffect = async () => {
      const info = router.query["info"];
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
    <Main
      meta={
        <Meta title={AppConfig.title} description={AppConfig.description} />
      }
    >
      {state}
    </Main>
  );
};

export default ShowTaskPageInterceptor;
