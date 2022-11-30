import React from 'react';

import Styles from './Footer.module.css';

export const Footer = () => (
  <div className={`${Styles.container}`}>
    {/* TODO: insert links to footer text */}
    <div className={`${Styles.group}`}>
      Important links: <br/> <br />

      Programming tools <br/> <br />

      Upcoming Coding Contests <br />
      Host Your Contest <br />
      Problem Setting
    </div>
    <div className={`${Styles.group}`}>
      <br/> <br />

      Learning Resources <br /> <br />

      Getting Started <br />
      Practice Problems <br />
      NOI Tutorials <br />
    </div>
    <div className={`${Styles.group}`}>
      <br/> <br />
      
      More <br /> <br />

      Contact Us <br />
      Privacy Policy <br />
      Terms <br />
    </div>
  </div>
);
