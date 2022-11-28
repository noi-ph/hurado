import React from 'react';
import { useRouter } from 'next/router';

import Styles from './ProblemOverview.module.css';
import { ProblemTestDataDisplay } from '../TestDataDisplay';
import { http, HttpResponse } from 'utils/http';
import { AppConfig } from 'utils/AppConfig';
import { ServerAPI } from 'types/openapi';

type ProblemOverviewProps = {
  titleAlign: string;
  slug: string;
};

export const ProblemOverview = (props: ProblemOverviewProps) => {
  const [title, setTitle] = React.useState('Loading problem title...');
  const [statement, setStatement] = React.useState('Loading problem statement...');
  const [input, setInput] = React.useState('Loading problem input...');
  const [output, setOutput] = React.useState('Loading problem output...');

  const router = useRouter();

  React.useEffect(() => {(async () => {
    const res: HttpResponse<ServerAPI['Task']> = await http.get(`${AppConfig.server}/v1/tasks/${props.slug}`);
    if (res.status == 404) {
      setTitle('Problem not found.');
    } else if (res.status == 500) {
      setTitle('Something unexpected happened');
    } else if (res.status == 200) {
      setTitle(res.data.title);
      setStatement(res.data.statement);
    }
  })()}, [])

  return (
    <React.Fragment>
      <div className={`${Styles.title}`} align={props.titleAlign}>{title}</div>
      <div className={`${Styles.container}`}>
        <div className={`${Styles.statement}`}>{statement}</div>
        <div className={`${Styles.container}`}>
          <ProblemTestDataDisplay width='450px' height='200px' id='input-3249283472'>
            {input}
          </ProblemTestDataDisplay>
          <ProblemTestDataDisplay width='450px' height='200px' id='output-2134987489'>
            {output}
          </ProblemTestDataDisplay>
          <button className={`${Styles.solve}`} onClick={() => router.push(`/tasks/${props.slug}`)}>
            Solve!
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};