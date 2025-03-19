"use client";

import classNames from "classnames";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Chevron from "assets/icons/chevron.svg";
import styles from "./homepage.module.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FaqOpen = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>(null as any);

type FaqQuestionProps = {
  children: ReactNode;
};

export function FaqQuestion({ children }: FaqQuestionProps) {
  const [open, setOpen] = useContext(FaqOpen);

  const toggleOpen = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <h4
      className="inline-flex items-center text-white hover:opacity-75 cursor-pointer select-none"
      onClick={toggleOpen}
    >
      <Chevron
        className={classNames("inline mr-2", styles.chevron, open && styles.expanded)}
        height="12px"
        width="12px"
      />
      <div className="text-2xl font-semibold ">{children}</div>
    </h4>
  );
}

type FaqAnswerProps = {
  children: ReactNode;
};

export function FaqAnswer({ children }: FaqAnswerProps) {
  const [open] = useContext(FaqOpen);
  const [height, setHeight] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const answer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateState = () => {
      if (answer.current == null) {
        return;
      }

      setHeight(open ? answer.current.scrollHeight : 0);
      setOpacity(open ? 1 : 0);
    };

    updateState();
    window.addEventListener("resize", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
    };
  }, [open]);

  return (
    <h4
      className="transition-all duration-200 overflow-hidden"
      style={{ height, opacity }}
      ref={answer}
    >
      <div className="text-lg text-white box-border mx-4 mt-3">{children}</div>
    </h4>
  );
}

type FaqItemProps = {
  children: ReactNode;
};

export function FaqItem({ children }: FaqItemProps) {
  const openState = useState(true);

  return (
    <div className="py-3">
      <FaqOpen.Provider value={openState}>{children}</FaqOpen.Provider>
    </div>
  );
}
