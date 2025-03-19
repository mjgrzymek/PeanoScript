import type { TypeTree } from "../engineTypes";
import { safeParseType } from "../parsing/parse";
import { typeAstToTypeTree } from "./typeAstToTypeTree";

export function string2Type(s: string): TypeTree {
  return typeAstToTypeTree(safeParseType(s), undefined, undefined);
}
