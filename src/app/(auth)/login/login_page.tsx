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
import { zUserLogin } from "common/validation/user_validation";
import { applyValidationErrors, ResponseKind } from "common/responses";
import type { UserLoginError, UserLoginSuccess } from "@root/api/v1/auth/login/route";

type LoginForm = {
  username: string;
  password: string;
};

export function LoginPage() {
  const router = useRouter();
  const { setSession } = useSessionWithUpdate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(zUserLogin),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const url = getAPIPath({ kind: APIPath.Login });
      const response: AxiosResponse<UserLoginSuccess> = await http.post(url, {
        username: data.username,
        password: data.password,
      });

      setSession(response.data.data);
      router.refresh();
      router.push(getPath({ kind: Path.Home }));
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<UserLoginError> = e.response;
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
        <AuthTitle>Login</AuthTitle>
        <AuthDetails>
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
        </AuthDetails>
        <AuthButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Submit
        </AuthButton>
      </AuthForm>
      <AuthLinks>
        <AuthLink href={getPath({ kind: Path.AccountForgotPassword })}>
          Forgot your password
        </AuthLink>
        <AuthLink href={getPath({ kind: Path.AccountRegister })}>Register an account</AuthLink>
      </AuthLinks>
    </AuthMain>
  );
}

export default LoginPage;
