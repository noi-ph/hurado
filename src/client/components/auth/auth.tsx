import classNames from "classnames";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FormHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react";
import { FieldError } from "react-hook-form";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import Link, { LinkProps } from "next/link";
import styles from "./auth.module.css";

type AuthMainProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function AuthMain(props: AuthMainProps) {
  return <div {...props} className={classNames(props.className, "max-w-md mx-auto my-16")} />;
}

type AuthFormProps = DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;

export function AuthForm(props: AuthFormProps) {
  return (
    <form
      {...props}
      className={classNames(
        props.className,
        "flex flex-col justify-center items-start gap-4 px-9 py-6 border border-black rounded-2xl"
      )}
    />
  );
}

type AuthTitleProps = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;

export function AuthTitle(props: AuthTitleProps) {
  return (
    <h1 {...props} className={classNames(props.className, "text-4xl self-center text-center")} />
  );
}

type AuthDetails = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function AuthDetails(props: AuthGroupProps) {
  return (
    <div
      {...props}
      className={classNames(props.className, styles.details, "w-full h-fit gap-x-2 gap-y-2.5")}
    />
  );
}

type AuthGroupProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function AuthGroup(props: AuthGroupProps) {
  return <div {...props} className={classNames(props.className)} />;
}

type AuthLabelProps = DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

export function AuthLabel(props: AuthLabelProps) {
  return <label {...props} className={classNames(props.className, "mt-0.5")} />;
}

type AuthInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames(props.className, "w-full max-w-xs border-b border-gray-500")}
    />
  );
});

type AuthErrorProps = {
  className?: string;
  error: FieldError | undefined;
};

export function AuthError({ error, className }: AuthErrorProps) {
  return (
    <div className={classNames("text-red-500 text-sm [grid-area:error]", className)}>
      {error && error.message}
    </div>
  );
}

type AuthButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function AuthButton(props: AuthButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        props.className,
        "flex justify-center items-center w-full h-fit p-2 border border-black rounded-2xl bg-purple-500 hover:bg-purple-700 disabled:bg-purple-200"
      )}
    />
  );
}

type AuthLinksProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function AuthLinks(props: AuthLinksProps) {
  return <div {...props} className={classNames("mt-4 flex flex-col gap-1", props.className)} />;
}

type AuthLinkProps = Parameters<typeof Link>[0];
export function AuthLink(props: AuthLinkProps) {
  return (
    <Link
      {...props}
      className={classNames(
        "block text-center text-gray-700 opacity-70 hover:opacity-100",
        props.className
      )}
    />
  );
}
