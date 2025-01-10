"use client";

import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import http from 'client/http';
import { APIPath, getAPIPath, getPath, Path } from 'client/paths';
import type { TaskCreateSimpleError, TaskCreateSimplePayload } from '@root/api/v1/tasks/simple/route';
import { APISuccessResponse, ResponseKind, applyValidationErrors } from 'common/responses';
import { Modal } from '../modal/modal';
import { FormError, FormInput, FormLabel } from '../form/form';
import { zTaskCreateSimple } from 'common/validation/task_validation';


type TaskForm = {
  slug: string;
  title: string;
};

const TaskCreator = () => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const onButtonClick = useCallback(() => {
    setShowModal(true);
  }, [showModal]);

  const onModalHide = useCallback(() => {
    setShowModal(false);
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(zTaskCreateSimple),
  });

  const onSubmit = async (data: TaskForm) => {
    try {
      const response: AxiosResponse<APISuccessResponse<TaskCreateSimplePayload>> = await http.post(getAPIPath({ kind: APIPath.TaskCreateSimple }), data);
      router.push(getPath({ kind: Path.TaskEdit, uuid: response.data.data.id }));
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<TaskCreateSimpleError> = e.response;
        const data = response.data;
        switch(data.kind) {
          case ResponseKind.ForbiddenError:
            toast.error('You are not allowed to create tasks');
            break;
          case ResponseKind.ValidationError:
            applyValidationErrors(setError, data.errors);
            break;
          default:
            toast.error('An unexpected error occurred');
        }
      } else {
        toast.error('An network error occurred. Please try again.');
        return;
      }
    }
  };

  return (
    <>
      <button onClick={onButtonClick} className='text-blue-400 hover:text-blue-500'>
        New Task
      </button>

      <Modal show={showModal} onBackgroundClick={onModalHide}>
        <div className='w-96 max-w-full'>
          <div>
            <h3 className='text-center text-xl mb-4'>Create Task</h3>
            <FormLabel>Slug</FormLabel>
            <FormInput type='text' {...register('slug')} />
            <FormError error={errors.slug}  className='mb-4'/>
            <FormLabel>Title</FormLabel>
            <FormInput type='text' {...register('title')} />
            <FormError error={errors.title} className='mb-4' />
            <div className='text-center'>
              <button type="button" className='hover:opacity-70 disabled:opacity-25' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                Create
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskCreator;