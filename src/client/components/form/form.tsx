import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

export function FormLabel(
  props: DetailedHTMLProps<InputHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
) {
  return <label {...props} className={classNames("block text-lg", props.className)} />;
}

type HTMLInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const FormInput = forwardRef<HTMLInputElement, HTMLInputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames("block w-full border-b border-gray-500", props.className)}
    />
  );
});

type FormErrorProps = {
  className?: string;
  error: FieldError | undefined;
};

export function FormError({ error, className }: FormErrorProps) {
  return (
    <div className={classNames("text-red-500 text-sm", className)}>{error && error.message}</div>
  );
}

export function FormButton(
  props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
  return (
    <button
      {...props}
      type={props.type || "submit"}
      className={classNames(
        "text-white bg-blue-400 hover:bg-blue-500 rounded-lg text-lg px-4 py-1 disabled:bg-blue-200 disabled:hover:bg-blue-200 disabled:cursor-auto",
        props.className
      )}
    />
  );
}
