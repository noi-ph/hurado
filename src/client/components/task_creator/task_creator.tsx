"use client";

import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TaskCreateSimpleError, TaskCreateSimpleSuccess } from '@root/api/v1/tasks/simple/route';
import http from 'client/http';
import { APIPath, getAPIPath, getPath, Path } from 'client/paths';
import { ResponseKind, applyValidationErrors } from 'common/responses';
import { zTaskCreateSimple } from 'common/validation/task_validation';
import { Modal } from '../modal';
import { FormButton, FormError, FormInput, FormLabel } from '../form';


type TaskForm = {
  slug: string;
  title: string;
};

export function TaskCreator() {
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
      const response: AxiosResponse<TaskCreateSimpleSuccess> = await http.post(getAPIPath({ kind: APIPath.TaskCreateSimple }), data);
      router.refresh();
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
      <FormButton onClick={onButtonClick}>
        New Task
      </FormButton>

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
              <FormButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                Create
              </FormButton>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
