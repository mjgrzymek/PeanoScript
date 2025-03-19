"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";

import { EditorView } from "codemirror";

import { EditorOptions } from "../docData/codeExamples";
import { PeanoScriptExtension } from "./extensions";
import { savifyName } from "./utils";

export function CodeMirrorComponent(options: EditorOptions) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      let doc = undefined;
      if (options.saveAs) {
        doc ??= localStorage.getItem(savifyName(options.saveAs));
      }
      doc ??= options.initialDoc;
      const view = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            PeanoScriptExtension(options),
            EditorView.theme({
              "&": { height: "100%" },
            }),
          ],
        }),
        parent: editorRef.current,
      });

      return () => {
        view.destroy();
      };
    }
  }, [options]);

  return (
    <div
      className={` border border-gray-700 flex w-full ${
        options.big ? "h-[80vh]" : "max-w-[110ch] max-h-[80vh]"
      } mx-auto my-4 text-xs lg:text-sm `}
    >
      <div
        ref={editorRef}
        className={`  ${options.readOnly ? "" : "w-3/4"}  overflow-auto`}
      ></div>
      {/*panel goes here*/}
    </div>
  );
}
