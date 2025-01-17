import type React from "react";

type EnvInfo = {
  renderInfo?: {
    inMathMode?: boolean;
    alignContent?: boolean;
    pgfkeysArgs?: boolean;
    namedArguments?: (string | null)[];
    tikzEnvironment?: boolean;
  };
  signature?: string;
};

export const LATEX_MACROS = {
  '%': {
  },
  '\\': {
  },
  '$': {
  },
  bf: {
    signature: "m",
  },
  textbf: {
    signature: "m",
  },
  it: {
    signature: "m",
  },
  textit: {
    signature: "m",
  },
  tt: {
    signature: "m",
  },
  texttt: {
    signature: "m",
  },
  emph: {
    signature: "m",
  },
  underline: {
    signature: "m",
  },
  sout: {
    signature: "m",
  },
  textsc: {
    signature: "m",
  },
  tiny: {
    signature: "m",
  },
  scriptsize: {
    signature: "m",
  },
  small: {
    signature: "m",
  },
  normalsize: {
    signature: "m",
  },
  large: {
    signature: "m",
  },
  Large: {
    signature: "m",
  },
  LARGE: {
    signature: "m",
  },
  huge: {
    signature: "m",
  },
  Huge: {
    signature: "m",
  },
  HUGE: {
    signature: "m",
  },
  url: {
    signature: "m",
  },
  href: {
    signature: "m m",
  },
  section: {
    signature: "s m",
  },
  subsection: {
    signature: "s m",
  },
  subsubsection: {
    signature: "s m",
  },
  includegraphics: {
    signature: "o m",
  },
  item: {
    signature: "o",
  },
  arabic: {
    signature: "m",
  },
  roman: {
    signature: "m",
  },
  Roman: {
    signature: "m",
  },
  Alph: {
    signature: "m",
  },
  alph: {
    signature: "m",
  },
};

export const LATEX_ENVIRONMENTS = {
  center: {},
  enumerate: {
    signature: "o",
  },
  itemize: {
    signature: "o",
  },
} satisfies Record<string, EnvInfo>;

export const LATEX_STRINGS = {
  "``": () => {
    return <>&ldquo;</>;
  },
  "''": () => {
    return <>&rdquo;</>;
  },
  "--": () => <>&ndash;</>,
  "---": () => <>&mdash;</>,
} satisfies Record<string, React.ComponentType>;
