import { LatexArgument, LatexNode, LatexNodeEnvironment, LatexNodeMacro, LatexNodeString } from "./latex_types";


export function latexBrokenInline(node: LatexNodeMacro, source: string) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  return <span className="font-mono text-red-500">[err]{source.substring(start, end)}[err]</span>;
}

export function latexBrokenBlock(node: LatexNode, source: string) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  return <div className="font-mono text-red-500">[err]{source.substring(start, end)}[err]</div>;
}

export function latexPositionalString(args: LatexArgument[] | undefined, index: number): string | null {
  if (args == null || args.length <= index) {
    return null;
  }
  const arg = args[index];
  if (arg.content.length != 1) {
    return null;
  }
  const content = arg.content[0];
  if (content.type != "string") {
    return null;
  }
  return content.content;
}

export function latexPositionalArgument(args: LatexArgument[] | undefined, index: number): LatexNode[] | null {
  if (args == null || args.length <= index) {
    return null;
  }
  const arg = args[index];
  if (arg.content.length != 1) {
    return null;
  }
  return arg.content;
}

export function latexParseKwargs(node: LatexNodeMacro | LatexNodeEnvironment, index: number): Record<string, LatexNode[]> {
  // Something is strange with the parser. For some reason, it splits the content into multiple nodes
  // if it finds a '=' for environments, so you'll get ["key1", "=", "value1", ",", " ", "key2", "=", "value2"]
  // But if it's a macro, the args will be ["key2=value2, key2=value2"]
  // This function handles both cases

  if (node.args == null || node.args.length <= index) {
    return {};
  }

  const arg = node.args[index];

  // Look for any strings in the content that contain "=" and split them into multiple nodes
  const processed: LatexNode[] = [];
  for (const child of arg.content) {
    if (!latexGuardString(child) || isExactlyNodeString(child, "=") || !child.content.includes("=")) {
      processed.push(child);
      continue;
    }
    const pieces = splitBySymbol(child, "=");
    processed.push(...pieces);
  }

  return kwargsFromNodes(processed);
}


function splitBySymbol(original: LatexNodeString, symbol: string): LatexNode[] {
  const pieces: LatexNode[] = [];
  let offset = 0;

  function doPushPart(part: string) {
    if (part.length == 0) {
      return;
    }
    pieces.push({
      type: "string",
      content: part,
      position: {
        start: {
          line: original.position.start.line,
          column: original.position.start.column + offset,
          offset: original.position.start.offset + offset,
        },
        end: {
          line: original.position.start.line,
          column: original.position.start.column + offset + part.length,
          offset: original.position.start.offset + offset + part.length,
        },
      }
    });
    offset += part.length;
  }

  const parts = original.content.split(symbol);
  parts.forEach((part, idx) => {
    if (idx > 0) {
      doPushPart(symbol);
    }
    doPushPart(part);
  });

  return pieces;
}

function kwargsFromNodes(content: LatexNode[]): Record<string, LatexNode[]> {
  const kwargs: Record<string, LatexNode[]> = {};
  let idx = 0;
  while (idx < content.length) {
    if (idx + 2 >= content.length) {
      break;
    }

    const current = content[idx];
    const next = content[idx + 1];
    if (latexGuardString(current) && isExactlyNodeString(next, "=")) {
      idx += 2;
      const key = current.content;
      const value: LatexNode[] = [];
      while (idx < content.length) {
        const node = content[idx];
        if (isExactlyNodeString(node, ",")) {
          idx++;
          break;
        }
        value.push(node);
        idx++;
      }
      kwargs[key] = value;
    } else {
      idx++;
    }
  }
  return kwargs;
}

export function latexGuardString(node: LatexNode): node is LatexNodeString {
  return node.type == "string";
}

function isExactlyNodeString(node: LatexNode, content: string): boolean {
  return node.type == "string" && node.content == content;
}
