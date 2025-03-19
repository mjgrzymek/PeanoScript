"use client";
import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";

import { basicSetupSimple } from "./basicSetup";

interface TypeScriptCodeProps {
  code: string;
}

export const TypeScriptCode = ({ code }: TypeScriptCodeProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }

      const state = EditorState.create({
        doc: code,
        extensions: [
          javascript({ typescript: true }),
          basicSetupSimple,
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      editorViewRef.current = view;
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, [code]);

  return (
    <div className="rounded-lg overflow-hidden shadow-xs border border-gray-200 my-4 max-w-3xl">
      <div ref={editorRef} className="text-sm" />
    </div>
  );
};
