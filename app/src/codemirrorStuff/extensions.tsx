import { ReactNode } from "react";
import { EditorState, StateField, Transaction } from "@codemirror/state";

import { basicSetupSimple } from "./basicSetup";
import { ExtraInfo, LogInfo, ReturnMethod } from "../language/uiTypes";
import { createRoot } from "react-dom/client";
import { indentWithTab } from "@codemirror/commands";
import {
  WidgetType,
  keymap,
  EditorView,
  Panel,
  showPanel,
  highlightActiveLineGutter,
  highlightActiveLine,
} from "@codemirror/view";
import { EXAMPLE } from "../language/lezerHighlighting";

import {
  hoverTooltip,
  ViewPlugin,
  ViewUpdate,
  DecorationSet,
  Decoration,
} from "@codemirror/view";
import {
  code2Stuff,
  ExerciseResult,
  InterpreterKillSwitch,
} from "../language/engine/compile";
import { linter, Diagnostic, lintGutter } from "@codemirror/lint";
import { EditorOptions } from "../docData/codeExamples";
import { AmbiguityError, UnexpectedEOFError } from "../language/parsing/parse";
import { savifyName } from "./utils";

type GlobalError = { headline: string; description?: string };
type TypeInfo = {
  ret: string;
  implRet?: string;
  extra: ExtraInfo[];
  globalError?: GlobalError;
  exerciseResult?: ExerciseResult;
};

type WidgetLogType = "error" | "output" | "loading";

const loadingString = "Running...";
class LogWidget extends WidgetType {
  text: string;
  logType: WidgetLogType;
  logInfo: LogInfo;
  counterInterval: NodeJS.Timeout | undefined;

  constructor(logInfo: LogInfo) {
    super();
    this.text = loadingString;
    this.logType = "loading";
    this.logInfo = logInfo;
  }

  toDOM() {
    const wrap = document.createElement("span");
    // wrap.style.display = "inline-block";
    wrap.style.marginLeft = "8px";
    wrap.style.padding = "2px 6px";
    wrap.style.border = "1px solid #ccc";
    wrap.style.borderRadius = "4px";
    wrap.style.color = "#003";
    wrap.style.fontFamily = "monospace";
    wrap.style.fontSize = "90%";

    const updateDisplay = () => {
      if (this.logType === "error") {
        wrap.style.backgroundColor = "#ffaaaa";
        wrap.textContent = "✖ " + this.text;
      } else if (this.logType === "output") {
        wrap.style.backgroundColor = "#aaaaff";
        wrap.textContent = "→ " + this.text;
      } else if (this.logType === "loading") {
        wrap.style.backgroundColor = "#aaaaaa";
        wrap.textContent = loadingString;
        if (this.logInfo.counterHolder.counter > 0) {
          wrap.textContent += ` (${this.logInfo.counterHolder.counter}s)`;
        }
      }
    };
    updateDisplay();
    clearInterval(this.counterInterval);
    this.counterInterval = setInterval(() => {
      updateDisplay();
    }, 1000);

    (async () => {
      const { value, logType } = await this.logInfo.outPromise;
      this.text = value;
      this.logType = logType;
      updateDisplay();
      clearInterval(this.counterInterval);
    })();

    return wrap;
  }
  destroy(): void {
    clearInterval(this.counterInterval);
  }
}

type DisplayVarDefined = {
  varName: string;
  varType: string;
  shadowed: boolean;
};

type sidePanelArgs = {
  globalError: { headline: string; description?: string } | undefined;
  variablesAtCursor: DisplayVarDefined[];
  expectedReturn: string | undefined;
  returnMethod: ReturnMethod | undefined;
};

function renderSidePanel({
  globalError,
  variablesAtCursor,
  expectedReturn,
  returnMethod,
}: sidePanelArgs) {
  return (
    <div className="l h-full overflow-y-auto bg-gray-200 p-2 font-mono text-sm text-pretty">
      {globalError ? (
        <>
          <p className="text-lg font-bold text-red-600">
            {globalError.headline}
          </p>
          <p className="text-red-600">{globalError.description}</p>
        </>
      ) : null}
      <p className="mt-2 font-bold">Defined Variables:</p>
      {variablesAtCursor.length > 0 ? (
        <ul>
          {variablesAtCursor.map((variable, index) => (
            <li
              key={index}
              className={variable.shadowed ? "text-gray-600 line-through" : ""}
            >
              <span className="font-bold">{variable.varName}</span>:{" "}
              {variable.varType}
            </li>
          ))}
        </ul>
      ) : (
        <p>None</p>
      )}
      <p className="mt-2 font-bold">Expected {returnMethod ?? "return"}:</p>
      <p>{expectedReturn ?? "Any"}</p>
    </div>
  );
}

function simplifyError(err: Error): string | undefined {
  if (
    err instanceof AmbiguityError ||
    err instanceof UnexpectedEOFError ||
    "PeaScriptErrorTag" in err
  ) {
    return err.message;
  }
  const match = err.message.match(/^Syntax error at line (\d+) col (\d+):/);
  if (match === null) {
    return undefined;
  }
  const line = parseInt(match[1]);
  const col = parseInt(match[2]);
  return `Syntax error at line ${line}, column ${col}`;
}

const disableGrammarlyPlugin = ViewPlugin.fromClass(
  class {
    constructor(view: EditorView) {
      const editor = view.contentDOM;
      editor.setAttribute("data-gramm", "false");
    }
  },
);

export const PeanoScriptExtension = (options: EditorOptions) => {
  let interpreterKillSwitch: InterpreterKillSwitch = { kill: false }; // SUS?

  function computeTypeInfo(code: string): TypeInfo {
    interpreterKillSwitch.kill = true;
    interpreterKillSwitch = { kill: false };
    try {
      return code2Stuff(
        code,
        options.compilerOptions,
        options.exercise,
        interpreterKillSwitch,
      );
    } catch (e) {
      if (!(e instanceof Error)) {
        return {
          ret: "weird error2",
          extra: [],
          globalError: { headline: "Unexpected error" },
        };
      }
      const extra: ExtraInfo[] = [];

      if (
        "token" in e &&
        typeof e.token === "object" &&
        e.token !== null &&
        "offset" in e.token &&
        typeof e.token.offset === "number" &&
        "text" in e.token &&
        typeof e.token.text === "string"
      ) {
        extra.push({
          infoType: "error",
          errorText: simplifyError(e) ?? "bad parse",
          meta: {
            start: e.token.offset,
            end: e.token.offset + e.token.text.length,
          },
        });
      }
      return {
        ret: "bad2",
        extra,
        globalError: {
          headline: "Syntax error",
          description: simplifyError(e),
        },
      };
    }
  }

  const cursorPositionField = StateField.define<number>({
    create() {
      return 0;
    },
    update(value, transaction: Transaction) {
      if (transaction.selection) {
        return transaction.selection.main.head;
      }
      return value;
    },
  });

  const sidePanelPlugin = ViewPlugin.fromClass(
    class {
      dom: HTMLDivElement;
      reactRoot: {
        render: (children: ReactNode) => void;
        unmount: () => void;
      } | null = null;
      lastArgs: sidePanelArgs;

      constructor(view: EditorView) {
        this.dom = document.createElement("div");

        this.dom.className = (<div className="w-1/4" />).props.className;

        // sus, we're going into our own outside container
        const parent = view.dom.parentNode as HTMLElement;

        parent.after(this.dom);

        this.reactRoot = createRoot(this.dom);
        // save last args
        this.lastArgs = {
          globalError: undefined,
          variablesAtCursor: [],
          expectedReturn: "",
          returnMethod: undefined,
        };
        this.updatePanel(view);
      }

      update(update: ViewUpdate) {
        if (update.selectionSet || update.docChanged) {
          this.updatePanel(update.view);
        }
      }

      updatePanel(view: EditorView) {
        const cursorPosition = view.state.field(cursorPositionField);

        const typeInfo = view.state.field(typeInfoField);
        const globalError = typeInfo.globalError;
        const extra = typeInfo.extra.filter((info) => {
          return (
            "meta" in info &&
            typeof info.meta?.start === "number" &&
            typeof info.meta?.end === "number" &&
            info.meta?.start <= cursorPosition &&
            cursorPosition <= info.meta.end
          );
        });

        // Filter variables defined where the cursor is
        const uniqueVarNames = new Set<string>();
        const variablesAtCursor: DisplayVarDefined[] = [];
        for (const info of extra.toReversed()) {
          if (info.infoType === "var defined") {
            if (!uniqueVarNames.has(info.varName)) {
              uniqueVarNames.add(info.varName);
              variablesAtCursor.push({
                varName: info.varName,
                varType: info.varType,
                shadowed: false,
              });
            } else {
              variablesAtCursor.push({
                varName: info.varName,
                varType: info.varType,
                shadowed: true,
              });
            }
          }
        }
        variablesAtCursor.reverse();

        let expectedReturn: string | undefined = undefined;
        let returnMethod: ReturnMethod | undefined = undefined;
        for (const info of extra) {
          // get the last one
          if (info.infoType === "required") {
            expectedReturn = info.requirement;
            returnMethod = info.returnMethod;
          }
        }
        let newArgs: sidePanelArgs;
        if (globalError) {
          newArgs = { ...this.lastArgs, globalError };
        } else {
          newArgs = {
            globalError,
            variablesAtCursor,
            expectedReturn,
            returnMethod,
          };
          this.lastArgs = newArgs;
        }
        this.reactRoot?.render(renderSidePanel(newArgs));
      }

      destroy() {
        if (this.reactRoot) {
          setTimeout(() => this.reactRoot?.unmount(), 0);
        }
        this.dom.remove();
      }
    },
  );

  const consoleLogPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = Decoration.set([]);
        this.updateStuff(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.updateStuff(update.view);
        }
      }

      updateStuff(view: EditorView) {
        const widgets = [];
        const { extra } = view.state.field(typeInfoField);
        for (const e of extra) {
          if (e.infoType !== "log") {
            continue;
          }
          const deco = Decoration.widget({
            widget: new LogWidget(e),
            side: 1,
          });
          widgets.push(deco.range(e.meta.end));
        }
        this.decorations = Decoration.set(widgets);
      }
    },
    {
      decorations: (v) => v.decorations,

      eventHandlers: {},
    },
  );

  const typeInfoField = StateField.define<TypeInfo>({
    create(state) {
      return computeTypeInfo(state.doc.toString());
    },
    update(value, transaction) {
      if (transaction.docChanged) {
        return computeTypeInfo(transaction.newDoc.toString());
      }
      return value;
    },
  });

  const wordHover = hoverTooltip((view, pos) => {
    const { extra } = view.state.field(typeInfoField);
    for (const e of extra) {
      if (
        e.infoType === "var hover" &&
        e.varInfo.start <= pos &&
        pos <= e.varInfo.end
      ) {
        return {
          pos: e.varInfo.start,
          end: e.varInfo.end,
          above: true,
          create() {
            const dom = document.createElement("div");
            dom.textContent = e.type;
            return { dom };
          },
        };
      }
    }
    return null;
  });
  const saveOnChangePlugin = ViewPlugin.fromClass(
    class {
      update(update: ViewUpdate) {
        if (options.saveAs && update.docChanged) {
          localStorage.setItem(
            savifyName(options.saveAs),
            update.view.state.doc.toString(),
          );
        }
      }
    },
  );

  const myLinter = linter(
    (view) => {
      const diagnostics: Diagnostic[] = [];
      const { extra } = view.state.field(typeInfoField);

      for (const e of extra) {
        if (e.infoType === "error") {
          const from = e.meta.start;
          const to = e.meta.end;
          diagnostics.push({
            from,
            to,
            severity: "error",
            message: e.errorText + "\n",
            actions: e.actionInfo
              ? [
                  {
                    name: "Fix",
                    apply(view, from, to) {
                      view.dispatch({
                        changes: { from, to, insert: e.actionInfo!.value },
                      });
                    },
                  },
                ]
              : [],
          });
        }
      }

      return diagnostics;
    },
    { delay: 1 },
  );

  function createExercisePanel(
    view: EditorView,
    initialCode: string,
    solutionCode: string,
  ): Panel {
    const dom = document.createElement("div");
    dom.className = (
      <div className="flex items-center justify-between border-t border-gray-300 p-2" />
    ).props.className;

    // Create status message element
    const statusEl = document.createElement("div");
    statusEl.setAttribute("data-element", "status");
    statusEl.className = (
      <div className="font-medium text-gray-500" />
    ).props.className;
    statusEl.textContent = "Solve the exercise...";

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = (
      <div className="flex gap-2" />
    ).props.className;

    // Create Reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = (
      <div className="rounded-sm bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300" />
    ).props.className;
    resetButton.onclick = () => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: initialCode },
      });
    };

    // Create Solution button
    const solutionButton = document.createElement("button");
    solutionButton.textContent = "Solution";
    solutionButton.className = (
      <div className="rounded-sm bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" />
    ).props.className;
    solutionButton.onclick = () => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: solutionCode },
      });
    };

    // Add buttons to container
    buttonsContainer.appendChild(resetButton);
    buttonsContainer.appendChild(solutionButton);

    // Add elements to panel
    dom.appendChild(statusEl);
    dom.appendChild(buttonsContainer);

    return {
      dom,
      update(update) {
        const field = update.state.field(typeInfoField);
        const exerciseResult = field?.exerciseResult;
        const hasError = field.extra.some((info) => info.infoType === "error");

        if (!exerciseResult) {
          // Handle undefined exerciseResult
          statusEl.textContent = "Solve the exercise...";
          statusEl.className = (
            <div className="font-medium text-gray-500" />
          ).props.className;
          return;
        }

        const { sorryUsed, varDefined, varCorrectlyTyped } = exerciseResult;
        if (hasError) {
          statusEl.textContent = "Error found";
          statusEl.className = (
            <div className="font-medium text-red-500" />
          ).props.className;
        } else if (!sorryUsed && varDefined && varCorrectlyTyped) {
          // All conditions met - exercise is solved
          statusEl.textContent = "✓ Exercise solved correctly!";
          statusEl.className = (
            <div className="font-medium text-green-500" />
          ).props.className;
        } else if (!varDefined) {
          // Variable not defined warning
          statusEl.textContent = "Don't remove the variable declaration";
          statusEl.className = (
            <div className="font-medium text-red-500" />
          ).props.className;
        } else if (!varCorrectlyTyped) {
          // Variable type is wrong warning
          statusEl.textContent = "Don't change the type of the variable";
          statusEl.className = (
            <div className="font-medium text-red-500" />
          ).props.className;
        } else if (sorryUsed) {
          // Normal "not solved yet" state
          statusEl.textContent = "Remove the sorry to solve";
          statusEl.className = (
            <div className="font-medium text-gray-500" />
          ).props.className;
        }
      },
    };
  }
  // Create the exercise panel extension
  function exercisePanel(initialCode: string, solutionCode: string) {
    return showPanel.of((view) =>
      createExercisePanel(view, initialCode, solutionCode),
    );
  }

  const ret = [
    basicSetupSimple,
    wordHover,
    typeInfoField,
    saveOnChangePlugin,
    myLinter,
    cursorPositionField,
    consoleLogPlugin,
    keymap.of([indentWithTab]),
    EXAMPLE(),
    disableGrammarlyPlugin,
  ];

  if (options.saveAs) {
    ret.push(saveOnChangePlugin);
  }

  if (options.exercise) {
    ret.push(exercisePanel(options.initialDoc, options.exercise.solution));
  }

  if (options.readOnly) {
    ret.push(EditorState.readOnly.of(true));
    ret.push(EditorView.editable.of(false));
  } else {
    ret.push(sidePanelPlugin);
    ret.push(highlightActiveLineGutter());
    ret.push(highlightActiveLine());
    ret.push(lintGutter());
  }

  return ret;
};
