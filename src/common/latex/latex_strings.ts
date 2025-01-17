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

class TrieNode {
  // TrieNode for the Aho-Corasick Algorithm

  children: Record<string, TrieNode>;
  fail: TrieNode | null;
  output: string[];

  constructor() {
    this.children = {};  // map from character -> TrieNode
    this.fail = null;    // the "failure link" (points to another TrieNode)
    this.output = [];    // list of patterns that end at this node
  }

  static build(dictionary: string[]): TrieNode {
    const root = new TrieNode();

    // 1. Insert all dictionary words into the trie
    for (const word of dictionary) {
      let current = root;
      for (const c of word) {
        if (!current.children[c]) {
          current.children[c] = new TrieNode();
        }
        current = current.children[c];
      }
      // Once we’ve inserted the full word, mark the output on that final node
      current.output.push(word);
    }

    // 2. Build the failure links using BFS
    const queue: TrieNode[] = [];

    // For each child of root, its fail link is root itself
    for (const c in root.children) {
      const child = root.children[c];
      child.fail = root;
      queue.push(child);
    }

    // BFS to build the rest of the failure links
    while (queue.length > 0) {
      const current = queue.shift() as TrieNode;
      // For each possible edge from 'current'
      for (const c in current.children) {
        const child = current.children[c];
        // Find the fail link for this child
        let failCandidate = current.fail;

        // Follow fail links until we find a node with the same character or we reach root
        while (failCandidate && !(c in failCandidate.children)) {
          failCandidate = failCandidate.fail;
        }

        // If we found a node with the same character, set child.fail to that node's child
        child.fail = failCandidate
          ? failCandidate.children[c]
          : root;

        // Merge output patterns (if the fail link node has them, we add them)
        child.output = child.output.concat(child.fail.output);

        queue.push(child);
      }
    }

    return root;
  }
}

const LATEX_STRINGS_TRIE = TrieNode.build(Object.keys(LATEX_STRINGS));

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
  const occurrences = findOccurrences(fragments, LATEX_STRINGS_TRIE);
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
  const sorted = splits.toSorted((a, b) => {
    const diffStart = a.start - b.start;
    if (diffStart != 0) {
      return diffStart;
    }
    return b.end - a.end;
  });
  let highest = -1;
  const pruned: FragmentSplit[] = [];
  for (const split of sorted) {
    if (split.start >= highest) {
      pruned.push(split);
      highest = split.end;
    }
  }
  return pruned;
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
  // Watch out! Javascript sorting is really dumb
  const sorted = [...points.keys()].toSorted((a, b) => a - b);
  const result: FragmentSplit[] = [];
  for (let i = 1; i < sorted.length; i++) {
    result.push({ start: sorted[i-1], end: sorted[i] });
  }
  return result;
}

function extractSplit(fragments: StringFragment[], split: FragmentSplit): StringFragment[] {
  return fragments.slice(split.start, split.end);
}

function findOccurrences(fragments: StringFragment[], root: TrieNode): FragmentSplit[] {
  // Runs the Aho Corasick algorithm to find all occurrences of all dictionary strings
  // Each occurrence is tracked as a FragmentSplit which notes the indices where it starts ane ends
  const results: FragmentSplit[] = [];

  let current = root;

  for (let i = 0; i < fragments.length; i++) {
    const c = fragments[i].char;

    // Follow fail links if there's no matching child
    while (current && !(c in current.children)) {
      current = current.fail!;
    }

    // If current is null, reset to root
    if (!current) {
      current = root;
    } else {
      // Move to the matching child
      current = current.children[c];
    }

    // If we've ended up in a node that has output (meaning a dictionary word ends here)
    if (current.output.length > 0) {
      // Each output word is found at the index `i`
      for (const word of current.output) {
        const endIndex = i + 1;
        const startIndex = i - word.length + 1;
        results.push({ start: startIndex, end: endIndex });
      }
    }
  }
  return results;
}
