import { UnreachableError } from "common/errors";
import {
  LatexNodeString,
  LatexNodeWhitespace,
  NodePoint,
} from "./latex_types";
import { LATEX_STRINGS } from "./latex_macros";

export type LatexNodeStringLike = LatexNodeString | LatexNodeWhitespace;

type StringFragment = {
  char: string;
  startLine: number;
  startColumn: number;
  startOffset: number;
  endLine: number;
  endColumn: number;
  endOffset: number;
};

type FragmentSplit = {
  start: number;
  end: number;
};

type MagicSubstring = keyof typeof LATEX_STRINGS;
const MAGIC_SUBSTRINGS = Object.keys(LATEX_STRINGS) as MagicSubstring[];


export function latexProcessStringLike(nodes: LatexNodeStringLike[]): LatexNodeStringLike[] {
  // This function concatenates all nodes into one giant string
  // Then it looks for all substrings in a magic dictionary and splits by that
  // Essentially if the dictionary is ["mp", "str"] and the nodes are ["exam", "plestr", "ingstrong"]
  // The result should be ["exa", "mp", "le", "str", "ing", "str", "ong"]
  // There's just a lot of bookkeeping to keep track of string positions 

  // Chop everything up into fragments
  const fragments: StringFragment[] = [];
  for (const node of nodes) {
    if (node.type === "string") {
      fragments.push(...fragmentBreakdown(node));
    } else if (node.type === "whitespace") {
      fragments.push(fragmentWhitespace(node));
    } else {
      throw new UnreachableError(node);
    }
  }

  // Find all occurrences of all MAGIC_SUBSTRINGs. This may have many overlapping occurrences
  const occurrences = findOccurrences(fragments, MAGIC_SUBSTRINGS);
  // Remove all overlapping occurrences by greedy algorithm
  const pruned = pruneSplits(occurrences);
  // Create a linear list of splits that cover the entire range
  const linear = linearizeSplits(fragments, pruned);
  // Extract the fragments for reconstruction
  const splits = linear.map(occ => extractSplit(fragments, occ));
  // Reconstruct the LatexNodes from the fragments
  return splits.map(split => fragmentReconstruct(split));
}

function fragmentBreakdown(node: LatexNodeString): StringFragment[] {
  const fragments: StringFragment[] = [];
  for (let i = 0; i < node.content.length; i++) {
    fragments.push({
      char: node.content[i],
      startLine: node.position.start.line,
      startColumn: node.position.start.column + i,
      startOffset: node.position.start.offset + i,
      endLine: node.position.start.line,
      endColumn: node.position.start.column + i,
      endOffset: node.position.start.offset + i,
    });
  }
  return fragments;
}

function fragmentWhitespace(node: LatexNodeWhitespace): StringFragment {
  // Make a fragment from a Whitespace node.
  // This intentionally returns the same shape as fragmentBreakdown for v8 optimization purposes
  return {
    char: ' ',
    startLine: node.position.start.line,
    startColumn: node.position.start.column,
    startOffset: node.position.start.offset,
    endLine: node.position.end.line,
    endColumn: node.position.end.column,
    endOffset: node.position.end.offset,
  };
}

function fragmentReconstruct(fragments: StringFragment[]): LatexNodeStringLike {
  const content = fragments.map(f => f.char).join("");
  const first = fragments[0];
  const start: NodePoint = {
    line: first.startLine,
    column: first.startColumn,
    offset: first.startOffset,
  };

  const last = fragments[fragments.length - 1];
  const end: NodePoint = {
    line: last.endLine,
    column: last.endColumn,
    offset: last.endOffset,
  };

  if (content.match(/\\s+/)) {
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
      content,
      position: {
        start,
        end,
      },
    };
  }
}

function pruneSplits(splits: FragmentSplit[]): FragmentSplit[] {
  // Runs a greedy algorithm to remove overlaps among splits
  // This prioritizes splits that start first
  // In case of ties, it prioritizes splits that end last
  return splits.sort((a, b) => {
    const diffStart = a.start - b.start;
    if (diffStart != 0) {
      return diffStart;
    }
    return b.end - a.end;
  });
}

function linearizeSplits(fragments: StringFragment[], splits: FragmentSplit[]): FragmentSplit[] {
  // Creates a linear list of splits so that all fragments are covered
  const points = new Set<number>();
  points.add(0);
  points.add(fragments.length);
  for (const split of splits) {
    points.add(split.start);
    points.add(split.end);
  }
  const sorted = points.keys().toArray().toSorted();
  const result: FragmentSplit[] = [];
  for (let i = 1; i < sorted.length; i++) {
    result.push({ start: sorted[i-1], end: sorted[i] });
  }
  return result;
}

function extractSplit(fragments: StringFragment[], split: FragmentSplit): StringFragment[] {
  return fragments.slice(split.start, split.end);
}

function findOccurrences(fragments: StringFragment[], dictionary: string[]): FragmentSplit[] {
  // Runs the Aho Corasick algorithm to find all occurrences of all dictionary strings
  // Each occurrence is tracked as a FragmentSplit which notes the indices where it starts ane ends
  return [];
}
