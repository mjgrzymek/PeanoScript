export type ArithmeticTree =
  | { type: "var"; value: string }
  | { type: "zero" }
  | { type: "+" | "*"; left: ArithmeticTree; right: ArithmeticTree }
  | { type: "succ"; value: ArithmeticTree };

export type TypeTreeEq = {
  type: "==";
  left: ArithmeticTree;
  right: ArithmeticTree;
};

export type Rung = {
  type: "rung";
  value: TypeTreeEq;
};

export type TypeTree =
  | TypeTreeEq
  | { type: "||" | "&&"; left: TypeTree; right: TypeTree }
  | { type: "t=>"; leftName: string; left: TypeTree; right: TypeTree }
  | TTreeStruct
  | { type: "N" }
  | { type: "never" }
  | ArithmeticTree
  | Rung
  | { type: "any" }
  | { type: "typevar"; value: string };

export type TTreeField = { type: "tfield"; left: string; right: TypeTree };
export type TTreeStruct = { type: "tstruct"; value: TTreeField[] };

type GenericArg = { name: string; constraint: "N" | "Prop" };
type GenericType = {
  type: "generic=>";
  args: GenericArg[];
  body: TypeTree;
};

export type TaggedType =
  | { kind: "generic typedef"; value: GenericType }
  | { kind: "arithmetic"; value: ArithmeticTree }
  | { kind: "proof"; value: TypeTree }
  | { kind: "typedef"; value: TypeTree };
export function removeNumberIndex(s: string): string {
  const match = s.match(/^(.*?)(\d*)$/);
  if (!match) {
    throw new Error(`removeNumberIndex: no match in ${s}`);
  }
  return match[1];
}
