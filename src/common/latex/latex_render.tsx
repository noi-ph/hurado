import { ReactNode } from "react";
import katex from "katex";
import { getParser } from "@unified-latex/unified-latex-util-parse";
import { UnreachableDefault } from "common/errors";
import {
  LatexArgument,
  LatexNode,
  LatexNodeDisplayMath,
  LatexNodeEnvironment,
  LatexNodeGroup,
  LatexNodeInlineMath,
  LatexNodeMacro,
  LatexNodeRoot,
} from "./latex_types";
import { LATEX_ENVIRONMENTS, LATEX_MACROS } from "./latex_macros";
import { mergeLatexNodeStrings } from "./latex_strings";
import 'katex/dist/katex.css';

const LatexParser = getParser({
  macros: LATEX_MACROS,
  environments: LATEX_ENVIRONMENTS,
});

type RenderLatexResult = { node: ReactNode } | { error: unknown };

export function renderLatex(source: string): RenderLatexResult {
  const parsed = LatexParser.parse(source) as unknown as LatexNode;
  try {
    const merged = mergeLatexNodeStrings(parsed);
    const node = <LatexNodeAnyX node={merged} source={source} />;
    return { node };
  } catch (e) {
    return { error: e };
  }
}

type LatexNodeProps<T extends LatexNode> = {
  node: T;
  source: string;
};

function LatexNodeAnyX({ node, source }: LatexNodeProps<LatexNode>): React.ReactNode {
  switch (node.type) {
    case "whitespace":
      return " ";
    case "string":
      return node.content;
    case "inlinemath":
      return <LatexNodeInlineMathX node={node} source={source} />;
    case "displaymath":
      return <LatexNodeDisplayMathX node={node} source={source} />;
    case "parbreak":
      return <br />;
    case "macro":
      return <LatexNodeMacroX node={node} source={source} />;
    case "environment":
      return <LatexNodeEnvironmentX node={node} source={source} />;
    case "group":
      return <LatexNodeGroupX node={node} source={source} />;
    case "comment":
      return null;
    case "root":
      return <LatexNodeGroupX node={node} source={source} />;
    default:
      // Functionally useless type assertion
      UnreachableDefault(node)
      return null;
  }
}

function LatexNodeInlineMathX({ node, source }: LatexNodeProps<LatexNodeInlineMath>) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  let subsource = source.substring(start, end);
  if (subsource.startsWith("$")) {
    subsource = subsource.substring(1, subsource.length - 1);
  } else if (subsource.startsWith("\\(")) {
    subsource = subsource.substring(2, subsource.length - 2);
  }
  try {
    const html = katex.renderToString(subsource, {
      displayMode: false,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e: any) {
    if ("message" in e) {
      return <span className="font-mono text-red-500">{e.message}</span>;
    } else {
      return renderBroken(node, source);
    }
  }
}

function LatexNodeDisplayMathX({ node, source }: LatexNodeProps<LatexNodeDisplayMath>) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  let subsource = source.substring(start, end);
  if (subsource.startsWith("$$") || subsource.startsWith("\\[")) {
    subsource = subsource.substring(2, subsource.length - 2);
  }
  try {
    const html = katex.renderToString(subsource, {
      displayMode: true,
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e: any) {
    if ("message" in e) {
      return <div className="font-mono text-red-500">{e.message}</div>;
    } else {
      return renderBroken(node, source);
    }
  }
}

function LatexNodeMacroX({ node, source }: LatexNodeProps<LatexNodeMacro>): React.ReactNode {
  switch (node.content) {
    case "bf":
    case "textbf":
      return <strong>{renderArgumentContent(node.args, source)}</strong>;
    case "it":
    case "textit":
      return <span className="italic">{renderArgumentContent(node.args, source)}</span>;
    case "tt":
    case "texttt":
      return <span className="font-mono">{renderArgumentContent(node.args, source)}</span>;
    case "emph":
    case "underline":
      return <span className="underline">{renderArgumentContent(node.args, source)}</span>;
    case "sout":
      return <span className="line-through">{renderArgumentContent(node.args, source)}</span>;
    case "textsc":
      return <span className="uppercase">{renderArgumentContent(node.args, source)}</span>;
    case "tiny":
      return <span className="text-xs">{renderArgumentContent(node.args, source)}</span>;
    case "scriptsize":
      return <span className="text-xs">{renderArgumentContent(node.args, source)}</span>;
    case "small":
      return <span className="text-sm">{renderArgumentContent(node.args, source)}</span>;
    case "normalsize":
      return <span className="text-base">{renderArgumentContent(node.args, source)}</span>;
    case "large":
      return <span className="text-lg">{renderArgumentContent(node.args, source)}</span>;
    case "Large":
      return <span className="text-xl">{renderArgumentContent(node.args, source)}</span>;
    case "LARGE":
      return <span className="text-2xl">{renderArgumentContent(node.args, source)}</span>;
    case "huge":
      return <span className="text-3xl">{renderArgumentContent(node.args, source)}</span>;
    case "Huge":
      return <span className="text-4xl">{renderArgumentContent(node.args, source)}</span>;
    case "HUGE":
      return <span className="text-5xl">{renderArgumentContent(node.args, source)}</span>;
    case "url": {
      const href = getStringArg(node.args, 0);
      if (href == null) {
        return renderBroken(node, source);
      }
      return (
        <a className="text-blue-500 hover:text-blue-400" target="_blank" href={href}>
          {href}
        </a>
      );
    }
    case "href": {
      const href = getStringArg(node.args, 0);
      if (href == null) {
        return renderBroken(node, source);
      }
      return (
        <a className="text-blue-500 hover:text-blue-400" target="_blank" href={href}>
          {renderArgumentContent(node.args, source, 1)}
        </a>
      );
    }
    case "includegraphics": {
      // Don't use the second arg yet
      const src = getStringArg(node.args, 1);
      if (src == null) {
        return renderBroken(node, source);
      }
      return <img className="max-w-full mx-auto" src={src} />;
    }
    case "$":
    case "%":
      return node.content;
    default:
      // Functionally useless type assertion
      UnreachableDefault(node.content)
      return node.content;
  }
}

function LatexNodeEnvironmentX({ node, source }: LatexNodeProps<LatexNodeEnvironment>) {
  return node.content.map((child, idx) => <LatexNodeAnyX key={idx} node={child} source={source} />);
}

function LatexNodeGroupX({ node, source }: LatexNodeProps<LatexNodeGroup | LatexNodeRoot>) {
  return node.content.map((child, idx) => <LatexNodeAnyX key={idx} node={child} source={source} />);
}

function renderBroken(node: LatexNode, source: string) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  return <span className="font-mono text-red-500">[err]{source.substring(start, end)}[err]</span>;
}

function renderArgumentContent(
  args: LatexArgument[] | undefined,
  source: string,
  index: number = 0
): ReactNode {
  if (args == null || args.length <= index) {
    return null;
  }
  return args[index].content.map((child, idx) => (
    <LatexNodeAnyX key={idx} node={child} source={source} />
  ));
}

function getStringArg(args: LatexArgument[] | undefined, index: number): string | null {
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
