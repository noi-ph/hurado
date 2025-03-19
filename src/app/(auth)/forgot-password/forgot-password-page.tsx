"use client";

import { AxiosError, AxiosResponse } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import http from "client/http";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";
import {
  AuthButton,
  AuthDetails,
  AuthError,
  AuthForm,
  AuthGroup,
  AuthInput,
  AuthLabel,
  AuthLink,
  AuthLinks,
  AuthMain,
  AuthTitle,
} from "client/components/auth/auth";
import { zUserForgotPassword } from "common/validation/user_validation";
import { applyValidationErrors, ResponseKind } from "common/responses";
import { UnreachableCheck } from "common/errors";
import type {
  ForgotPasswordError,
  ForgotPasswordSuccess,
} from "@root/api/v1/auth/forgot-password/route";

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
      const url = getAPIPath({ kind: APIPath.ForgotPassword });
      const response: AxiosResponse<ForgotPasswordSuccess> = await http.post(url, {
        username: data.username,
      });
      toast.success(`Email sent to ${response.data.data.email}`);
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<ForgotPasswordError> = e.response;
        const data = response.data;
        switch (data.kind) {
          case ResponseKind.ValidationError:
            applyValidationErrors(setError, data.errors);
            break;
          default:
            UnreachableCheck(data.kind);
            toast.error("An unexpected error occurred");
        }
      } else {
        toast.error("An network error occurred. Please try again.");
        throw e;
      }
    }
  };

  return (
    <AuthMain>
      <AuthForm>
        <AuthTitle>Forgot Password</AuthTitle>
        <AuthDetails>
          <AuthLabel>Username:</AuthLabel>
          <AuthGroup>
            <AuthInput {...register("username")} />
            <AuthError error={errors.username} />
          </AuthGroup>
        </AuthDetails>
        <AuthButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Reset Password
        </AuthButton>
      </AuthForm>
      <AuthLinks>
        <AuthLink href={getPath({ kind: Path.AccountLogin })}>Go back to login</AuthLink>
      </AuthLinks>
    </AuthMain>
  );
}
