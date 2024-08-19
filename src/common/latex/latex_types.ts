import { LATEX_ENVIRONMENTS, LATEX_MACROS } from "./latex_macros";

export type LatexMacroType = keyof typeof LATEX_MACROS;
export type LatexEnvironmentType = keyof typeof LATEX_ENVIRONMENTS;

export type NodePoint = {
  offset: number;
  line: number;
  column: number;
};

export type NodePosition = {
  start: NodePoint;
  end: NodePoint;
};

type BaseNode<T> = T & {
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

export type LatexNodeWhitespace = BaseNode<{
  type: "whitespace";
}>;

export type LatexNodeString = BaseNode<{
  type: "string";
  content: string;
}>;

export type LatexNodeMacro = BaseNode<{
  type: "macro";
  content: LatexMacroType; // Macro name
  args?: LatexArgument[];
}>;

export type LatexNodeParbreak = BaseNode<{
  type: "parbreak";
}>;

export type LatexNodeInlineMath = BaseNode<{
  type: "inlinemath";
}>;

export type LatexNodeDisplayMath = BaseNode<{
  type: "displaymath";
}>;

export type LatexNodeEnvironment = BaseNode<{
  type: "environment"; // \begin{env}...\end{env}
  env: string; // This is the environment type
  content: LatexNode[];
}>;

export type LatexNodeGroup = BaseNode<{
  type: "group"; // \begin{env}...\end{env}
  content: LatexNode[]; // This is the environment type
}>;

export type LatexNodeComment = BaseNode<{
  type: "comment";
  content: string;
}>;

export type LatexNodeRoot = BaseNode<{
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
  | LatexNodeGroup
  | LatexNodeComment
  | LatexNodeRoot;
