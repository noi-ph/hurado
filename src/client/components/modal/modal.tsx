"use client";

import classNames from 'classnames';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import React, { MouseEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';


interface ModalProps {
  children: React.ReactNode;
  show: boolean;
  onBackgroundClick?(event: MouseEvent<HTMLDivElement>): void;
}

export function Modal({ show, onBackgroundClick, children }: ModalProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // When this component is first mounted, it looks for #modal-root in the DOM
    const root = document.getElementById('modal-root');
    if (root == null) {
      return;
    }

    // Then it creates a div inside that element and uses it as the mount point for the modal
    const localMount = document.createElement('div');
    root.appendChild(localMount);
    setMount(localMount);

    // When this component is unmounted, it removes the mount point from the DOM
    return () => {
      localMount.remove();
      setMount(null);
    }
  }, []);

  const actualOnBackgroundClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (onBackgroundClick) {
      onBackgroundClick(event);
    }
  }, [onBackgroundClick]);

  if (mount == null) {
    return;
  }

  // Use ReactDOM.createPortal to render the modal content inside the mount point
  return ReactDOM.createPortal(
    <>
      <div className={classNames("fixed top-0 bottom-0 left-0 right-0 bg-black opacity-50 z-[10000]", !show && "hidden")} onClick={actualOnBackgroundClick}/>
      <div className={classNames('absolute min-h-full flex justify-center items-center pointer-events-none inset-0 z-[10001]', !show && "hidden")}>
        <div className='pointer-events-auto bg-white p-6'>
          {children}
        </div>
      </div>
    </>,
    mount
  );
};
