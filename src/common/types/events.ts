import { ChangeEvent, MouseEvent } from "react";

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = ChangeEvent<HTMLSelectElement>;
export type TextAreaChangeEvent = ChangeEvent<HTMLTextAreaElement>;
export type ButtonClickEvent = MouseEvent<HTMLButtonElement>;
