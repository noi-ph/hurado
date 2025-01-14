import { LatexArgument, LatexNode, LatexNodeMacro, LatexNodeString } from "./latex_types";


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

export function latexParseKwargs(arg: LatexArgument | undefined): Record<string, LatexNode[] | undefined> {
  if (arg == null) {
    return {};
  }

  function isEqualString(node: LatexNode, content: string): boolean {
    return node.type == "string" && node.content == content;
  }

  const kwargs: Record<string, LatexNode[]> = {};
  const content = arg.content;
  let idx = 0;
  while (idx < content.length) {
    if (idx + 2 >= content.length) {
      break;
    }

    const current = content[idx];
    const next = content[idx + 1];
    if (latexGuardString(current) && isEqualString(next, "=")) {
      idx += 2;
      const key = current.content;
      const value: LatexNode[] = [];
      while (idx < content.length) {
        const node = content[idx];
        if (isEqualString(node, ",")) {
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

function latexGuardString(node: LatexNode): node is LatexNodeString {
  return node.type == "string";
}
