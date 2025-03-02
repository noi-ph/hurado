"use client";

import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ContestCreateError, ContestCreateSuccess } from '@root/api/v1/contests/page';
import http from 'client/http';
import { APIPath, getAPIPath, getPath, Path } from 'client/paths';
import { ResponseKind, applyValidationErrors } from 'common/responses';
import { zContestCreate } from 'common/validation/contest_validation';
import { Modal } from '../modal';
import { FormButton, FormError, FormInput, FormLabel } from '../form';


type ContestForm = {
  slug: string;
  title: string;
};

export function ContestCreator() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const onButtonClick = useCallback(() => {
    setShowModal(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [showModal]);

  const onModalHide = useCallback(() => {
    setShowModal(false);
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContestForm>({
    resolver: zodResolver(zContestCreate),
  });

  const onSubmit = async (data: ContestForm) => {
    try {
      const response: AxiosResponse<ContestCreateSuccess> = await http.post(getAPIPath({ kind: APIPath.ContestCreate }), data);
      router.refresh();
      router.push(getPath({ kind: Path.ContestEdit, uuid: response.data.data.id }));
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<ContestCreateError> = e.response;
        const data = response.data;
        switch(data.kind) {
          case ResponseKind.ForbiddenError:
            toast.error('You are not allowed to create problem contests');
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
        New Contest
      </FormButton>

      <Modal show={showModal} onBackgroundClick={onModalHide}>
        <div className='w-96 max-w-full'>
          <div>
            <h3 className='text-center text-xl mb-4'>Create Contest</h3>
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
