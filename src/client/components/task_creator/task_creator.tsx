"use client";

import React, { useCallback, useState } from 'react';
import { Modal } from '../modal/modal';

const TaskCreator = () => {
  const [showModal, setShowModal] = useState(false);

  const onButtonClick = useCallback(() => {
    setShowModal(true);
    console.log('hiding', showModal);
  }, [showModal]);

  const onModalHide = useCallback(() => {
    setShowModal(false);
    console.log('hey?');
  }, []);

  return (
    <div>
      <button onClick={onButtonClick}>
        Open Modal
      </button>

      <Modal show={showModal} onBackgroundClick={onModalHide}>
        <div>
          Hey this is a thing!
        </div>
      </Modal>
    </div>
  );
};

export default TaskCreator;