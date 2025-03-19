import { LATEX_ENVIRONMENTS, LATEX_MACROS } from "./latex_macros";

export type LatexMacroType = keyof typeof LATEX_MACROS;
export type LatexEnvironmentType = keyof typeof LATEX_ENVIRONMENTS;
export type LatexVerbatimType = "verbatim" | "lstlisting";

export type NodePoint = {
  offset: number;
  line: number;
  column: number;
};

export type NodePosition = {
  start: NodePoint;
  end: NodePoint;
};

export type LatexBaseNode<T> = T & {
  position: NodePosition;
};

// What follows are just all the nodes I've discovered
// that can be output by experimentation. This may not be an exhaustive list
export type LatexArgument = {
  type: "argument";
  content: LatexNode[];
  openMark: string;
  closeMark: string;
};

export type LatexNodeWhitespace = LatexBaseNode<{
  type: "whitespace";
}>;

export type LatexNodeString = LatexBaseNode<{
  type: "string";
  content: string;
}>;

export type LatexNodeMacro = LatexBaseNode<{
  type: "macro";
  content: LatexMacroType; // Macro name
  args?: LatexArgument[];
}>;

export type LatexNodeParbreak = LatexBaseNode<{
  type: "parbreak";
}>;

export type LatexNodeInlineMath = LatexBaseNode<{
  type: "inlinemath";
}>;

export type LatexNodeDisplayMath = LatexBaseNode<{
  type: "displaymath";
}>;

export type LatexNodeEnvironment = LatexBaseNode<{
  type: "environment"; // \begin{env}...\end{env}
  env: LatexEnvironmentType; // This is the environment type
  content: LatexNode[];
  args?: LatexArgument[];
}>;

export type LatexNodeVerbatim = LatexBaseNode<{
  type: "verbatim";
  env: LatexVerbatimType;
  content: string;
}>;

export type LatexNodeGroup = LatexBaseNode<{
  type: "group"; // \begin{env}...\end{env}
  content: LatexNode[]; // This is the environment type
}>;

export type LatexNodeComment = LatexBaseNode<{
  type: "comment";
  content: string;
}>;

export type LatexNodeRoot = LatexBaseNode<{
  type: "root";
  content: LatexNode[];
}>;

export type LatexNode =
  | LatexNodeWhitespace
  | LatexNodeString
  | LatexNodeMacro
  | LatexNodeParbreak
  | LatexNodeInlineMath
  | LatexNodeDisplayMath
  | LatexNodeEnvironment
  | LatexNodeVerbatim
  | LatexNodeGroup
  | LatexNodeComment
  | LatexNodeRoot;

export type LatexNodeProps<T extends LatexNode> = {
  node: T;
  source: string;
};
