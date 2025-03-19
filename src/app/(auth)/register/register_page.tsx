"use client";

import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useSessionWithUpdate } from "client/sessions";
import { UnreachableCheck } from "common/errors";
import { zUserRegister } from "common/validation/user_validation";
import { applyValidationErrors, ResponseKind } from "common/responses";
import { UserRegisterError, UserRegisterSuccess } from "@root/api/v1/auth/register/route";

type RegisterForm = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const router = useRouter();
  const { setSession } = useSessionWithUpdate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(zUserRegister),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const url = getAPIPath({ kind: APIPath.Register });
      const response: AxiosResponse<UserRegisterSuccess> = await http.post(url, {
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setSession(response.data.data);
      router.refresh();
      router.push(getPath({ kind: Path.Home }));
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<UserRegisterError> = e.response;
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
        <AuthTitle>Register</AuthTitle>
        <AuthDetails>
          <AuthLabel>Email:</AuthLabel>
          <AuthGroup>
            <AuthInput type="text" {...register("email")} />
            <AuthError error={errors.email} />
          </AuthGroup>
          <AuthLabel>Username:</AuthLabel>
          <AuthGroup>
            <AuthInput type="text" {...register("username")} />
            <AuthError error={errors.username} />
          </AuthGroup>
          <AuthLabel>Password:</AuthLabel>
          <AuthGroup>
            <AuthInput type="password" {...register("password")} />
            <AuthError error={errors.password} />
          </AuthGroup>
          <AuthLabel>Confirm Password:</AuthLabel>
          <AuthGroup>
            <AuthInput type="password" {...register("confirmPassword")} />
            <AuthError error={errors.confirmPassword} />
          </AuthGroup>
        </AuthDetails>
        <AuthButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Submit
        </AuthButton>
      </AuthForm>
      <AuthLinks>
        <AuthLink href={getPath({ kind: Path.AccountLogin })}>Already have an account</AuthLink>
      </AuthLinks>
    </AuthMain>
  );
}
