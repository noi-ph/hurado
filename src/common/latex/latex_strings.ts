import { UnreachableDefault } from "common/errors";
import {
  LatexArgument,
  LatexNode,
  LatexNodeString,
  LatexNodeWhitespace,
  NodePoint,
} from "./latex_types";

export function mergeLatexNodeStrings(node: LatexNode): LatexNode {
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
      if (node.args == null) {
        return node;
      }
      return {
        ...node,
        args: node.args.map(mergeArgumentStrings),
      };
    case "environment":
      return {
        ...node,
        content: mergeContentStrings(node.content),
      };
    case "group":
      return {
        ...node,
        content: mergeContentStrings(node.content),
      };
    case "root":
      return {
        ...node,
        content: mergeContentStrings(node.content),
      };
    default:
      // Functionally useless type assertion
      UnreachableDefault(node);
      return node;
  }
}

function mergeArgumentStrings(arg: LatexArgument): LatexArgument {
  return {
    ...arg,
    content: mergeContentStrings(arg.content),
  };
}

function mergeContentStrings(content: LatexNode[]): LatexNode[] {
  const result: LatexNode[] = [];
  const running: (LatexNodeString | LatexNodeWhitespace)[] = [];

  for (const child of content) {
    if (child.type == "string") {
      running.push(child);
    } else if (child.type == "whitespace") {
      running.push(child);
    } else {
      if (running.length > 0) {
        const str = mergeStrings(running);
        result.push(str);
        // Empty out the array
        running.length = 0;
      }
      result.push(mergeLatexNodeStrings(child));
    }
  }

  if (running.length > 0) {
    const str = mergeStrings(running);
    result.push(str);
    // Empty out the array
    running.length = 0;
  }

  return result;
}

function mergeStrings(nodes: (LatexNodeString | LatexNodeWhitespace)[]): LatexNode {
  let start: NodePoint = nodes[0].position.start;
  let end: NodePoint = nodes[0].position.end;

  const running: string[] = [];
  for (const node of nodes) {
    if (node.position.start.offset < start.offset) {
      start = node.position.start;
    }
    if (node.position.end.offset >= end.offset) {
      end = node.position.end;
    }
    running.push(node.type == "string" ? node.content : " ");
  }
  const combined = running.join("").replace("\\s+", " ");
  if (combined == " ") {
    return {
      type: "whitespace",
      position: {
        start,
        end,
      },
    };
  } else {
    return {
      type: "string",
      content: combined,
      position: {
        start,
        end,
      },
    };
  }
}
