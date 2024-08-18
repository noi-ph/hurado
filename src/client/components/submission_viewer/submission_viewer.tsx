"use client";

import { editor } from "monaco-editor";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useCallback, useRef } from "react";
import { SubmissionViewerDTO } from "common/types";
import { humanizeLanguage } from "common/types/constants";

type SubmissionViewerProps = {
  submission: SubmissionViewerDTO;
};

const MonacoOptions: editor.IEditorConstructionOptions = Object.freeze({
  readOnly: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
});

const CodeEditorMinimumHeight = 72;

export const SubmissionViewer = ({ submission }: SubmissionViewerProps) => {
  return (
    <>
      <div className="text-2xl mb-2">Submitted Code</div>
      <SubmissionCodeViewer submission={submission} />
      <div className="text-2xl mb-2">Submitted Code</div>
      <SubmissionCodeViewer submission={submission} />
    </>
  );
};


const SubmissionVerdictViewer = ({ submission }: SubmissionViewerProps) => {
  return null;
};

const SubmissionCodeViewer = ({ submission }: SubmissionViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Magic code that resizes the editor, mostly stolen from:
  // https://github.com/microsoft/monaco-editor/issues/794#issuecomment-427092969
  const onEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    if (containerRef.current == null) {
      return;
    }

    editorRef.current = editor;

    const el = containerRef.current;
    const codeContainer = el.getElementsByClassName("view-lines")[0] as HTMLElement;

    requestAnimationFrame(() => {
      const height = Math.max(CodeEditorMinimumHeight, codeContainer.offsetHeight);
      el.style.height = height + "px";
      editor.layout();
    });
  }, []);

  return (
    <div className="border border-gray-300">
      <div className="flex px-5 py-3 font-light box-border border-b border-gray-300">
        Language: {humanizeLanguage(submission.language)}
      </div>
      <div ref={containerRef}>
        <MonacoEditor
          value={submission.code}
          options={MonacoOptions}
          theme="light"
          onMount={onEditorMount}
        />
      </div>
    </div>
  );
};
