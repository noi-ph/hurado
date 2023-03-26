import React from "react";

import Styles from './Body.module.css';

type BodyProps = {
  children: React.ReactNode;
}

export const Body = (props: BodyProps) => (
  <div className={`${Styles.body}`}>
    {props.children}
  </div>
);
