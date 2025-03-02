import { UnreachableDefault } from "common/errors";
import {
  LatexArgument,
  LatexNode,
  LatexNodeMacro,
} from "./latex_types";
import { LatexNodeStringLike, latexProcessStringLike } from "./latex_strings";

export function latexProcessNode(node: LatexNode): LatexNode {
  switch (node.type) {
    case "comment":
      return node;
    case "whitespace":
      return node;
    case "string":
      return node;
    case "inlinemath":
      return node;
    case "displaymath":
      return node;
    case "parbreak":
      return node;
    case "macro":
      return latexProcessMacro(node);
    case "environment":
      return {
        ...node,
        content: latexProcessContentStrings(node.content),
      };
    case "verbatim":
      return node;
    case "group":
      return {
        ...node,
        content: latexProcessContentStrings(node.content),
      };
    case "root":
      return {
        ...node,
        content: latexProcessContentStrings(node.content),
      };
    default:
      // Functionally useless type assertion
      UnreachableDefault(node);
      return node;
  }
}

export function latexProcessMacro(node: LatexNodeMacro): LatexNodeMacro {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
  let merged: LatexNodeMacro;
  if (node.args == null) {
    return node;
  } else {
    return {
      ...node,
      args: node.args.map(mergeArgumentStrings),
    };
  }
}

function mergeArgumentStrings(arg: LatexArgument): LatexArgument {
  return {
    ...arg,
    content: latexProcessContentStrings(arg.content),
  };
}

function latexProcessContentStrings(content: LatexNode[]): LatexNode[] {
  // Concatenates all string-like nodes and runs custom post-processing on them
  // All macros, groups, and other latex nodes are also considered delimiters.
  // They are post-processed in-and-of themselves and injected into the final result
  // without getting merged into any string-like concatenations.
  //
  // Read the code of `latexProcessStringLike` to understand what our post-processing does.
  // In short, it splits out magic substrings from long latex strings.

  const result: LatexNode[] = [];
  const running: LatexNodeStringLike[] = [];

  for (const child of content) {
    if (child.type == "string") {
      running.push(child);
    } else if (child.type == "whitespace") {
      running.push(child);
    } else {
      if (running.length > 0) {
        const pieces = latexProcessStringLike(running);
        result.push(...pieces);
        // Empty out the array
        running.length = 0;
      }
      result.push(latexProcessNode(child));
    }
  }

  if (running.length > 0) {
    const pieces = latexProcessStringLike(running);
    result.push(...pieces);
  }

  return result;
}
