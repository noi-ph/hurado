import { ReactNode, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
// eslint-disable-next-line import/order -- pre-existing error before eslint inclusion
import { LatexNodeProps, LatexNodeVerbatim } from "./latex_types";
import hljs from 'highlight.js/lib/core';
import "highlight.js/styles/intellij-light.min.css";

import hBash from 'highlight.js/lib/languages/bash';
import hClang from 'highlight.js/lib/languages/c';
import hCPP from 'highlight.js/lib/languages/cpp';
import hCSS from 'highlight.js/lib/languages/css';
import hLatex from 'highlight.js/lib/languages/latex';
import hJava from 'highlight.js/lib/languages/java';
import hJavascript from 'highlight.js/lib/languages/javascript';
import hJSON from 'highlight.js/lib/languages/json';
import hMarkdown from 'highlight.js/lib/languages/markdown';
import hPython from 'highlight.js/lib/languages/python';
import hRust from 'highlight.js/lib/languages/rust';
import hScheme from 'highlight.js/lib/languages/scheme';
import hSQL from 'highlight.js/lib/languages/sql';
import hTypeScript from 'highlight.js/lib/languages/typescript';
import hXML from 'highlight.js/lib/languages/xml';
import hX86 from 'highlight.js/lib/languages/x86asm';
import BoxIcon from "client/components/box_icon";

hljs.registerLanguage("bash", hBash);
hljs.registerLanguage("c", hClang);
hljs.registerLanguage("c++", hCPP);
hljs.registerLanguage("css", hCSS);
hljs.registerLanguage("latex", hLatex);
hljs.registerLanguage("java", hJava);
hljs.registerLanguage("javascript", hJavascript);
hljs.registerLanguage("json", hJSON);
hljs.registerLanguage("markdown", hMarkdown);
hljs.registerLanguage("python", hPython);
hljs.registerLanguage("rust", hRust);
hljs.registerLanguage("scheme", hScheme);
hljs.registerLanguage("sql", hSQL);
hljs.registerLanguage("typescript", hTypeScript);
hljs.registerLanguage("xml", hXML);
hljs.registerLanguage("x86", hX86);


// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export function LatexSyntaxHighlight({ node, source }: LatexNodeProps<LatexNodeVerbatim>): ReactNode {
  const trimmed = node.content.replace(/^\s*\n/, "");
  const highlighted = useMemo(() => hljs.highlightAuto(trimmed), [trimmed]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(trimmed);
    toast(`Copied to clipboard!`, { type: "success" });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, []);

  return (
    <div className="relative">
      <button type="button" className="absolute flex justify-center items-center top-2 right-2" onClick={copyToClipboard}>
        <BoxIcon name="bxs-copy" className="bx-sm text-gray-500 opacity-20 hover:opacity-80" />
      </button>
      <pre
        className="text-sm bg-gray-150 border border-gray-250 rounded-md p-2.5 [letter-spacing:0.001em]"
        dangerouslySetInnerHTML={{ __html: highlighted.value }}
      />
    </div>
  );
}
