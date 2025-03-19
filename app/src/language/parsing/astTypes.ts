import { Meta } from "../uiTypes";

export type Identifier = { type: "identifier"; value: string } & Meta;
export type Num = { type: "num"; value: string } & Meta;
export type KW = { type: "KW"; value: string } & Meta;
type TAstNot = { type: "t!"; value: TypeAst } & Meta;
type TypeGenericCall = {
  type: "type generic call";
  left: Identifier;
  right: (TypeAst | ArithmeticAst)[];
} & Meta;
// TODO separate type from arithmetic
export type TypeAst =
  | ({
      type: "==" | "!=";
      left: ArithmeticAst;
      right: ArithmeticAst;
    } & Meta)
  | ({
      type: "||" | "&&";
      left: TypeAst;
      right: TypeAst;
    } & Meta)
  | ({
      type: "t=>";
      leftName: Identifier;
      left: TypeAst;
      right: TypeAst;
    } & Meta)
  | TAstStruct
  | ArithmeticAst
  | TAstNot
  | TypeGenericCall;

export type TAstField = {
  type: "tfield";
  left: Identifier;
  right: TypeAst;
} & Meta;
export type TAstStruct = { type: "tstruct"; value: TAstField[] } & Meta;

type Return = {
  type: "return";
  value: ExpressionAst;
  kind: KW;
} & Meta;

type Typedef = { type: "typedef"; left: Identifier; right: TypeAst } & Meta;
type GenericTypeParameter = { name: Identifier; constraint: Identifier };
type GenericTypedef = {
  type: "generic typedef";
  name: Identifier;
  parameters: GenericTypeParameter[];
  value: TypeAst;
} & Meta;

type EmptyStatement = { type: "empty statement" } & Meta;

export type StatementAst =
  | Switch
  | MultiConst
  | Const
  | Return
  | Typedef
  | GenericTypedef
  | EmptyStatement
  | ConsoleLog;

export type Statements = {
  type: "statements";
  value: StatementAst[];
  topLevel?: true; // top level in editor
} & Meta;
type Const = {
  type: "const";
  left: Identifier;
  right: ExpressionAst;
  assertion: TypeAst | undefined;
} & Meta;
type EFunc = {
  type: "e=>";
  leftName: Identifier;
  left: TypeAst | undefined;
  right: ExpressionAst;
  assertion: TypeAst | undefined;
} & Meta;
type Efield = { type: "efield"; left: Identifier; right: ExpressionAst } & Meta;
type Estruct = { type: "estruct"; value: Efield[] } & Meta;
type As = { type: "as"; left: ExpressionAst; right: TypeAst } & Meta;
type Dot = { type: "."; left: ExpressionAst; right: Identifier } & Meta;
type For = {
  type: "for";
  iter: Const;
  proof: Const;
  cond: { type: "<"; left: ExpressionAst; right: ExpressionAst } & Meta;
  step: { type: "++"; value: Identifier } & Meta;
  body: ExpressionAst;
} & Meta;

type CaseGuard = {
  type: "case guard";
  left: Identifier;
  right: Identifier; // TODO cases with and and or not just or
} & Meta;

export type Case = {
  type: "case";
  left: CaseGuard;
  right: Statements;
} & Meta;

export type Switch = {
  type: "switch";
  value: ExpressionAst;
  cases: Case[];
} & Meta;

type IdentifierOrRename = { from: Identifier; to: Identifier | null };

export type MultiConst = {
  type: "multi const";
  left: IdentifierOrRename[];
  right: ExpressionAst;
} & Meta;

export type ConsoleLog = {
  type: "console.log";
  value: ExpressionAst[];
} & Meta;

export type Call = {
  type: "call";
  left: ExpressionAst;
  right: ExpressionAst | "empty call";
} & Meta;

export type GenericCall = {
  type: "generic call";
  left: Identifier;
  right: TypeAst;
} & Meta;

export type EAnd = {
  type: "e&&";
  left: ExpressionAst;
  right: ExpressionAst;
} & Meta;

export type ExpressionAst =
  | Identifier
  | Call
  | GenericCall
  | EAnd
  | Efield
  | Estruct
  | As
  | Dot
  | EFunc
  | For
  | Const
  | Statements
  | Switch
  | ArithmeticAst;

// TODO: AST will also have functions, I guess
export type ArithmeticAst =
  | Identifier
  | Num
  | ({ type: "+" | "*"; left: ArithmeticAst; right: ArithmeticAst } & Meta)
  | ({ type: "call"; left: Identifier; right: ArithmeticAst } & Meta);
