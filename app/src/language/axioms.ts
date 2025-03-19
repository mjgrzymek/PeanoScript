import { ImplContext, TypeContext } from "./engine/compile";
import { string2Type } from "./engine/string2Type";
export const axiomsList = [
  "eqRefl",
  "eqSym",
  "eqTrans",
  "succInj",
  "succNotZero",
  "addZero",
  "addSucc",
  "mulZero",
  "mulSucc",
];
export const axioms: TypeContext = Object.fromEntries(
  [
    ["eqRefl", "(x: N) => x == x"],
    ["eqSym", "(x: N) => (y: N) => (eqXY : x == y) => y == x"],
    ["eqSymm", "(x: N) => (y: N) => (eqXY : x == y) => y == x"],
    [
      "eqTrans",
      "(x: N) => (y: N) => (z: N) => (eqXY : x == y) => (eqYZ : y == z) => x == z",
    ],
    [
      "succInj",
      "(x: N) => (y: N) => (eqSuccXY : succ(x) == succ(y)) => x == y",
    ],
    ["succNotZero", "(x: N) => (p: succ(x) == 0) => never"],
    ["addZero", "(x: N) => x + 0 == x"],
    ["addSucc", "(x: N) => (y: N) => x + succ(y) == succ(x + y)"],
    ["mulZero", "(x: N) => x * 0 == 0"],
    ["mulSucc", "(x: N) => (y: N) => x * succ(y) == x * y + x"],
  ].map(([name, value]) => [
    name,
    {
      kind: "proof",
      value: string2Type(value),
    } as const,
  ])
);
axioms["any"] = { kind: "typedef", value: { type: "any" } };

export const axiomsImpl: ImplContext = {
  eqRefl: async () => "(eq)",
  eqSym: async () => async () => async (eq) => eq,
  eqSymm: async () => async () => async (eq) => eq,
  eqTrans: async () => async () => async () => async (eqXY) => async () => eqXY,
  succInj: async () => async () => async (eq) => eq,
  succNotZero: async () => async () => {
    throw new Error("runtimeError: succNotZero called");
  },
  addZero: async () => "(eq)",
  addSucc: async () => async () => "(eq)",
  mulZero: async () => "(eq)",
  mulSucc: async () => async () => "(eq)",
};
