import { createContext, ReactNode, useContext } from "react";
import { LatexArgument, LatexBaseNode, LatexNode } from "./latex_types";
import { UnreachableCheck } from "common/errors";
import { latexBrokenBlock, latexParseKwargs, latexPositionalArgument, latexPositionalString } from "./latex_utils";
import { LatexNodeAnyX } from "./latex_render";
import { LatexCounterContext } from "./latex_counters";

const ListBulletContext = createContext<LatexNode[] | null>(null);
const ListOrderedDepthContext = createContext<number>(-1);
const ListUnorderedDepthContext = createContext<number>(-1);

export type LatexMacroBulletOrdered = LatexBaseNode<{
  type: "macro";
  content: "arabic" | "roman" | "Roman" | "Alph" | "alph";
  args?: LatexArgument[];
}>;

export type LatexNodeItem = LatexBaseNode<{
  type: "macro";
  content: "item";
  args?: LatexArgument[];
}>;

export type LatexNodeList = LatexBaseNode<{
  type: "environment";
  env: "enumerate" | "itemize";
  content: LatexNode[];
  args: LatexArgument[];
}>;

export function latexEnvironmentList(node: LatexNodeList, source: string): ReactNode {

  switch(node.env) {
    case "enumerate": {
      return <ListOrdered node={node} source={source}/>;
    }
    case "itemize":
      return <ListUnordered node={node} source={source}/>;
    default:
      UnreachableCheck(node.env);
      return latexBrokenBlock(node, source);
  }
}

type LatexBulletOrderedProps = {
  node: LatexMacroBulletOrdered;
};

export function LatexBulletOrdered({ node }: LatexBulletOrderedProps) {
  const depth = useContext(ListOrderedDepthContext);
  const counters = useContext(LatexCounterContext);

  let counter = latexPositionalString(node.args, 0);
  if (counter == null || counter == "*") {
    counter = getDefaultListCounter(depth);
  }

  const order = counters[counter] ?? 0;

  switch(node.content) {
    case "alph":
      return orderToAlphabet(order);
    case "Alph":
      return orderToAlphabet(order).toUpperCase();
    case "roman":
      return orderToRoman(order).toUpperCase();
    case "Roman":
      return orderToRoman(order);
    case "arabic":
    default:
      return `${order + 1}`;
  }
}

function latexEnvironmentListChildren(node: LatexNodeList, source: string, ordered: boolean): ReactNode {
  const children: React.ReactNode[] = [];

  let order = 0;
  let builder: ItemBuilder | null = null;

  for (const child of node.content) {
    if (child.type === "macro" && child.content === "item") {
      // builder != null means we're not on the first item
      // We need to compile all the children of the previous item and add it to the list
      if (builder != null) {
        children.push(builder.build(children.length));
      }
      builder = new ItemBuilder(child as LatexNodeItem, order++, ordered);
    } else if (builder == null) {
      // If we ever hit a node that is NOT a \item and builder == null
      // Then that means the first child of the list environment is not an \item
      // This breaks the latex
      return latexBrokenBlock(node, source);
    } else {
      // If we're in the middle of an \item, just keep adding to the running list
      builder.push(<LatexNodeAnyX key={builder.items.length} node={child} source={source} />);
    }
  }

  if (builder != null) {
    children.push(builder.build(children.length));
  }

  return children;
}

class ItemBuilder {
  node: LatexNodeItem;
  order: number;
  ordered: boolean;

  items: ReactNode[];

  constructor(node: LatexNodeItem, order: number, ordered: boolean) {
    this.node = node;
    this.order = order;
    this.ordered = ordered;
    this.items = [];
  }

  push(child: ReactNode) {
    this.items.push(child);
  }

  build(key: number): ReactNode {
    const bullet = latexPositionalArgument(this.node.args, 0);
    return (
      <ListItem
        key={key}
        bullet={bullet}
        order={this.order}
        ordered={this.ordered}
      >
        {this.items}
      </ListItem>
    );
  }
}

type ListItemProps = {
  bullet: LatexNode[] | null;
  children: ReactNode;
  order: number;
  ordered: boolean;
};

function ListItem({ bullet: itemBullet, order, ordered, children }: ListItemProps) {
  const parentBullet = useContext(ListBulletContext);
  const depthOrdered = useContext(ListOrderedDepthContext);
  const depthUnordered = useContext(ListUnorderedDepthContext);
  const counters = useContext(LatexCounterContext);

  let rxBullet: ReactNode = null;
  if (itemBullet) {
    rxBullet = itemBullet.map((child, idx) => <LatexNodeAnyX key={idx} node={child} source="" />);
  } else if (parentBullet) {
    rxBullet = parentBullet.map((child, idx) => <LatexNodeAnyX key={idx} node={child} source="" />);
  } else if (ordered) {
    rxBullet = <BulletDefaultOrdered depth={depthOrdered}/>;
  } else {
    rxBullet = <BulletDefaultUnordered depth={depthUnordered}/>;
  }

  let nextCounters = counters;
  if (ordered) {
    const counter = getDefaultListCounter(depthOrdered);
    nextCounters = { ...counters, [counter]: order };
  }

  return (
    <LatexCounterContext.Provider value={nextCounters}>
      <li className="[list-style-type:none] relative">
        <span className="absolute left-[-.5rem] translate-x-[-100%]">
          {rxBullet}
        </span>
        {children}
      </li>
    </LatexCounterContext.Provider>
  );
}

type ListOrderedProps = {
  node: LatexNodeList;
  source: string;
};

function ListOrdered({ node, source }: ListOrderedProps) {
  const kwargs = latexParseKwargs(node.args[0]);
  const label = kwargs.label ?? null;
  const depth = useContext(ListOrderedDepthContext);
  const children = latexEnvironmentListChildren(node, source, true);

  return (
    <ListBulletContext.Provider value={label}>
      <ListOrderedDepthContext.Provider value={depth + 1}>
        <ol className="pl-6 list-decimal">
          {children}
        </ol>
      </ListOrderedDepthContext.Provider>
    </ListBulletContext.Provider>
  )
}

type ListUnordered = {
  node: LatexNodeList;
  source: string;
};

function ListUnordered({ node, source }: ListOrderedProps) {
  const kwargs = latexParseKwargs(node.args[0]);
  const label = kwargs.label ?? null;
  const depth = useContext(ListUnorderedDepthContext);
  const children = latexEnvironmentListChildren(node, source, false);

  return (
    <ListBulletContext.Provider value={label}>
      <ListUnorderedDepthContext.Provider value={depth + 1}>
        <ol className="pl-6 list-decimal">
          {children}
        </ol>
      </ListUnorderedDepthContext.Provider>
    </ListBulletContext.Provider>
  )
}


type BulletDefaultOrderedProps = {
  depth: number;
};

function BulletDefaultOrdered({ depth: rawDepth }: BulletDefaultOrderedProps) {
  // Default LaTeX ordered bullet styles
  // 1. > (a) > i. > A.

  const counters = useContext(LatexCounterContext);
  const depth = Math.min(rawDepth, 3);
  const counter = getDefaultListCounter(depth);
  const order = counters[counter] ?? 0;

  if (depth == 0) {
    return <span>{order + 1}.</span>;
  } else if (depth == 1) {
    return <span>({orderToAlphabet(order)})</span>;
  } else if (depth == 2) {
    return <span>{orderToRoman(order)}.</span>;
  } else {
    return <span>{orderToAlphabet(order).toUpperCase()}.</span>;
  }
}

type BulletDefaultUnorderedProps = {
  depth: number;
};

function BulletDefaultUnordered({ depth: rawDepth }: BulletDefaultUnorderedProps) {
  // Default LaTex unordered bullet styles
  // Big Dot > En Dash > Asterisk > Small Dot

  const depth = Math.min(rawDepth, 3);

  if (depth == 0) {
    return <span className="inline-block mb-2">●</span>;
  } else if (depth == 1) {
    return <span className="inline-block mb-2">–</span>;
  } else if (depth == 2) {
    return <span className="inline-block mb-2">⁎</span>;
  } else {
    return <span className="inline-block mb-2">•</span>;
  }
}

function orderToAlphabet(order: number): string {
  const capped = Math.min(order, 26);
  return String.fromCharCode(capped + 97);
}

function orderToRoman(order: number): string {
  const capped = Math.min(order, 20);
  const romanNumerals = [
    "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
    "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"
  ];
  return romanNumerals[capped];
}

function getDefaultListCounter(depth: number): string {
  switch(depth) {
    case 0:
      return "enumi";
    case 1:
      return "enumii";
    case 2:
      return "enumiii";
    default:
      return "enumiv";
  }
}
