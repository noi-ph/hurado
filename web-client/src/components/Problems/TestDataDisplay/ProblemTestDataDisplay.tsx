import React from 'react';

import Styles from './ProblemTestDataDisplay.module.css';

type ProblemTestDataDisplayProps = {
  children: React.ReactNode;
  width: string;
  height: string;
  id: string;
};

export const ProblemTestDataDisplay = (props: ProblemTestDataDisplayProps) => {
  React.useEffect(() => {
    const div = document.getElementById(props.id);
    if (div) {
      div.style.width = props.width;
      div.style.height = props.height;
    }
  }, []);

  return (
    <div className={`${Styles.data}`} id={props.id}>
      {props.children}
    </div>
  );
};