import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  useCallback,
} from "react";
import { InputChangeEvent, SelectChangeEvent, TextAreaChangeEvent } from "common/types/events";
import BoxIcon from "client/components/box_icon";
import { TaskED, TaskFileLocal } from "./types";
import classNames from "classnames";
import { sha256 } from "common/utils/hashing";
import styles from "./task_editor.module.css";

export function useTaskStringPropUpdater(
  task: TaskED,
  setTask: (task: TaskED) => void,
  key: string
) {
  return useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        [key]: event.target.value,
      });
    },
    [task, setTask]
  );
}

type TaskEditorAddButtonProps = {
  label: string;
  onClick(): void;
  disabled?: boolean;
};

export const TaskEditorAddButton = ({ onClick, disabled, label }: TaskEditorAddButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled} className={styles.addButton}>
      <BoxIcon name="bx-plus" className="bx-xs mt-1" />
      {label}
    </button>
  );
};

type TaskEditorActionButtonProps = {
  icon: string;
  size?: "bx-xs" | "bx-sm" | "bx-md" | "bx-lg" | "bx-xl";
  onClick(): void;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const TaskEditorActionButton = ({
  icon,
  size,
  onClick,
  ...rest
}: TaskEditorActionButtonProps) => {
  return (
    <button {...rest} onClick={onClick} className="text-gray-300 hover:text-gray-500">
      <BoxIcon
        name={icon}
        className={classNames("bx text-gray-300 hover:text-gray-500", size ?? "bx-xs")}
      />
    </button>
  );
};

type TaskEditorActionLinkProps = {
  icon: string;
  href: string;
} & DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const TaskEditorActionLink = ({ icon, href, ...rest }: TaskEditorActionLinkProps) => {
  return (
    <a href={href} {...rest} className="text-gray-300 hover:text-gray-500">
      <BoxIcon name={icon} className="bx bx-xs text-gray-300 hover:text-gray-500" />
    </a>
  );
};

type TaskEditorLabelProps = {
  label: string;
};

export const TaskEditorLabel = ({ label }: TaskEditorLabelProps) => {
  return <div className="text-lg text-gray-500">{label}</div>;
};

type TaskEditorInputProps = {
  value: string;
  onChange(event: InputChangeEvent | TextAreaChangeEvent): void;
  placeholder?: string;
  type: "text" | "textarea";
};

export const TaskEditorInput = ({ type, value, onChange, placeholder }: TaskEditorInputProps) => {
  if (type == "text") {
    return (
      <input
        className="font-mono p-2 border border-gray-300 rounded-lg"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  } else {
    return (
      <textarea
        className="font-mono p-2 border border-gray-300 rounded-lg h-24"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
};

type TaskEditorInputSubtleProps = {
  value: string;
  onChange(event: InputChangeEvent): void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const TaskEditorInputSubtle = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: TaskEditorInputSubtleProps) => {
  return (
    <input
      type="text"
      className={classNames(
        "outline-none border-b border-transparent focus:border-b-gray-300",
        disabled ? "text-gray-300" : "text-gray-500",
        className
      )}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

type TaskEditorSelectProps = {
  value: string;
  onChange(event: SelectChangeEvent): void;
  className?: string;
  children: ReactNode;
};

export const TaskEditorSelect = ({
  value,
  onChange,
  className,
  children,
}: TaskEditorSelectProps) => {
  return (
    <select
      className={classNames(className, "font-mono p-2 border border-gray-300 rounded-lg")}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
};

type TaskEditorTableCellProps = {
  children: React.ReactNode;
  deleted?: boolean;
};

export const TaskEditorTableCell = ({ deleted, children }: TaskEditorTableCellProps) => {
  return (
    <div className={classNames("font-roboto font-light text-gray-500", deleted && "line-through")}>
      {children}
    </div>
  );
};

export async function destructivelyComputeSHA1(local: TaskFileLocal) {
  // This mutates the TaskFileLocal but that's okay. As long as we don't save before
  // all of the destructivelyComputeSHA1s complete, it's fine.
  const buffer = await local.file.arrayBuffer();
  const sha1 = await sha256(buffer);
  local.hash = sha1;
}
