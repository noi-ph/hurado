"use client";

import { AxiosError, AxiosResponse } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  AuthMain,
  AuthTitle,
} from "client/components/auth/auth";
import { zUserResetPassword } from "common/validation/user_validation";
import { applyValidationErrors, ResponseKind } from "common/responses";
import { UnreachableCheck } from "common/errors";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ResetPasswordError, ResetPasswordSuccess } from "@root/api/v1/auth/reset-password/route";

type PasswordResetForm = {
  password: string;
  confirmPassword: string;
};

export function PasswordResetPage() {
  const [token, setToken] = useState("");
  const [tokenBad, setTokenBad] = useState(true);
  const router = useRouter();

  // Get the token from the URL and check if it's "valid" (not empty)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    const bad = t.length == 0;
    if (bad) {
      toast.error("Invalid token");
    } else {
      setToken(t);
      setTokenBad(bad);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordResetForm>({
    resolver: zodResolver(zUserResetPassword),
  });

  const onSubmit = async (data: PasswordResetForm) => {
    try {
      const url = getAPIPath({ kind: APIPath.ResetPassword });
      await http.post(url, {
        token: token,
        password: data.password,
      });
      toast.success("Successfully reset password!");
      router.push(getPath({ kind: Path.AccountLogin }));
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        const response: AxiosResponse<ResetPasswordError> = e.response;
        const data = response.data;
        switch (data.kind) {
          case ResponseKind.ValidationError:
            applyValidationErrors(setError, data.errors);
            if (data.errors.token != null && data.errors.token.length > 0) {
              toast.error("The password reset token is invalid");
              setTokenBad(true);
            }
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
        <AuthTitle>Password Reset</AuthTitle>
        <AuthDetails>
          <AuthLabel>Password:</AuthLabel>
          <AuthGroup>
            <AuthInput type="password" disabled={tokenBad} {...register("password")} />
            <AuthError error={errors.password} />
          </AuthGroup>
          <AuthLabel>Confirm Password:</AuthLabel>
          <AuthGroup>
            <AuthInput type="password" disabled={tokenBad} {...register("confirmPassword")} />
            <AuthError error={errors.confirmPassword} />
          </AuthGroup>
        </AuthDetails>
        <AuthButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting || tokenBad}>
          Reset Password
        </AuthButton>
      </AuthForm>
    </AuthMain>
  );
}
