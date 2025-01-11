"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { zUserForgotPassword } from "common/validation/user_validation";
import { AuthButton, AuthError, AuthForm, AuthGroup, AuthInput, AuthLabel, AuthTitle } from "client/components/auth/auth";
import { AxiosError, AxiosResponse } from "axios";
import { PasswordResetError, PasswordResetSuccess } from "@root/api/v1/auth/password_reset/route";
import { applyValidationErrors, ResponseKind } from "common/responses";
import { UnreachableCheck } from "common/errors";

type ForgotPasswordForm = {
  username: string;
};

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(zUserForgotPassword),
  });


  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response: AxiosResponse<PasswordResetSuccess> = await http.post(getAPIPath({ kind: APIPath.PasswordReset }), {
        username: data.username,
      });
      toast.success(`Email sent to ${response.data.data.email}`);
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<PasswordResetError> = e.response;
        const data = response.data;
        switch(data.kind) {
          case ResponseKind.ValidationError:
            applyValidationErrors(setError, data.errors);
            break;
          default:
            UnreachableCheck(data.kind);
            toast.error('An unexpected error occurred');
        }
      } else {
        toast.error('An network error occurred. Please try again.');
        return;
      }
    }
  };

  return (
    <AuthForm>
      <AuthTitle>Password Reset</AuthTitle>
      <AuthGroup>
        <AuthLabel>Username:</AuthLabel>
        <AuthInput {...register('username')}/>
        <AuthError error={errors.username}/>
      </AuthGroup>
      <AuthButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        Reset Password
      </AuthButton>
    </AuthForm>
  );
};

