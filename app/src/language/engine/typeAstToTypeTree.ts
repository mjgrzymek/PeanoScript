import type { TypeTree, ArithmeticTree, TTreeField } from "../engineTypes";
import type { TypeAst } from "../parsing/astTypes";
import { bigintStringify } from "../ui";
import type { ExtraInfo } from "../uiTypes";
import type { TypeContext } from "./compile";

import {
  bigIntToSuccs,
  retrieveFromContext,
  makeTagged,
  unparseType,
  freeInType,
  freeify,
  rewriteType,
  postError,
} from "./engineUtils";

export function typeAstToTypeTree(
  ast: TypeAst,
  context: TypeContext = {},
  extra: ExtraInfo[] | undefined
): TypeTree {
  const rec = (ast: TypeAst, context: TypeContext): TypeTree =>
    typeAstToTypeTree(ast, context, extra);

  try {
    if (ast.type === "identifier") {
      if (ast.value === "N") {
        return { type: "N" };
      }
      if (ast.value === "never") {
        return { type: "never" };
      }
      const type = retrieveFromContext(context, ast.value);
      if (type === undefined) {
        throw new Error(`typeAstToTypeTree: unknown variable ${ast}`);
      }
      if (type.kind !== "arithmetic" && type.kind !== "typedef") {
        throw new Error(
          `typeAstToTypeTree: can't use "${type.kind}" kind in type context (name ${ast})`
        );
      }
      return type.value;
    }
    if (ast.type === "num") {
      return bigIntToSuccs(BigInt(ast.value));
    }
    if (ast.type === "t=>") {
      const left = rec(ast.left, context);
      return {
        type: "t=>",
        leftName: ast.leftName.value,
        left,
        right: rec(ast.right, {
          ...context,
          [ast.leftName.value]:
            left.type === "N"
              ? {
                  kind: "arithmetic",
                  value: { type: "var", value: ast.leftName.value },
                }
              : { kind: "proof", value: left },
        }),
      };
    }
    if (
      ast.type === "==" ||
      ast.type === "+" ||
      ast.type === "*" ||
      ast.type === "!="
    ) {
      const left = rec(ast.left, context);
      const right = rec(ast.right, context);
      if (makeTagged(left).kind !== "arithmetic") {
        throw new Error(
          `left of ${ast.type} must be arithmetic, got ${unparseType(left)}`
        );
      }
      if (makeTagged(right).kind !== "arithmetic") {
        throw new Error(
          `right of ${ast.type} must be arithmetic, got ${unparseType(right)}`
        );
      }
      if (ast.type === "!=") {
        return {
          type: "t=>",
          leftName: "_",
          left: {
            type: "==",
            left: left as ArithmeticTree,
            right: right as ArithmeticTree,
          },
          right: { type: "never" },
        };
      }
      return {
        type: ast.type,
        left: left as ArithmeticTree,
        right: right as ArithmeticTree,
      };
    }

    if (ast.type === "||" || ast.type === "&&") {
      return {
        type: ast.type,
        left: rec(ast.left, context),
        right: rec(ast.right, context),
      };
    }
    if (ast.type === "call") {
      if (ast.left.value !== "succ") {
        throw new Error(`typeAstToTypeTree: unhandled call ${ast.left}`);
      }
      const inside = rec(ast.right, context);
      if (makeTagged(inside).kind !== "arithmetic") {
        throw new Error(
          `typeAstToTypeTree: succ argument must be arithmetic, got ${unparseType(
            inside
          )}`
        );
      }
      return {
        type: "succ",
        value: inside as ArithmeticTree,
      };
    }
    if (ast.type === "tstruct") {
      const fields: TTreeField[] = [];
      for (const field of ast.value) {
        const right = rec(field.right, context);
        fields.push({
          type: "tfield",
          left: field.left.value,
          right,
        });
        if (right.type === "N") {
          context = {
            ...context,
            [field.left.value]: {
              kind: "arithmetic",
              value: { type: "var", value: field.left.value },
            },
          };
        }
      }
      if (
        fields.some((f) => f.left === "left") &&
        fields.some((f) => f.left === "right")
      ) {
        throw new Error(
          `The names "left" and "right" are reserved for And types. To declare an And type, use the && operator`
        );
      }
      return {
        type: "tstruct",
        value: fields,
      };
    }
    if (ast.type === "t!") {
      return {
        type: "t=>",
        leftName: "_",
        left: rec(ast.value, context),
        right: { type: "never" },
      };
    }
    if (ast.type === "type generic call") {
      const varValue = retrieveFromContext(context, ast.left.value);
      if (varValue === undefined) {
        throw new Error(`typeAstToTypeTree: unknown generic "${ast.left}"`);
      }
      if (varValue.kind !== "generic typedef") {
        throw new Error(`typeAstToTypeTree: "${ast.left}" is not a generic`);
      }
      const generic = varValue.value;
      if (generic.args.length !== ast.right.length) {
        throw new Error(
          `typeAstToTypeTree: generic "${ast.left}" requires ${generic.args.length} arguments, got ${ast.right.length}`
        );
      }
      let ret = generic.body;
      const renames = new Map<number, string>();
      for (let i = 0; i < generic.args.length; i++) {
        const declaredArg = generic.args[i];
        const providedArg = ast.right[i];
        const providedType = rec(providedArg, context);
        const providedKind = makeTagged(providedType).kind;
        const expcetedKind =
          declaredArg.constraint === "N" ? "arithmetic" : "proof";
        if (providedKind !== expcetedKind) {
          throw new Error(
            `typeAstToTypeTree: generic "${ast.left}" argument ${i} must be ${declaredArg.constraint}, got ${providedKind}`
          );
        }
        for (let j = i + 1; j < generic.args.length; j++) {
          const oldName = generic.args[j].name;
          if (freeInType(oldName, providedType)) {
            const newName = freeify(oldName, [providedType, ret]);
            renames.set(j, newName);
            ret = rewriteType(ret, oldName, {
              type: "typevar", // idk lol
              value: newName,
            });
          }
        }
        const declaredName = renames.has(i)
          ? renames.get(i)!
          : declaredArg.name;
        ret = rewriteType(ret, declaredName, providedType);
      }
      return ret;
    }
    const _: never = ast.type;
    throw new Error(
      `typeAstToTypeTree: unknown type "${ast.type}" "${bigintStringify(ast)}"`
    );
  } catch (err) {
    postError(extra, ast, err);
    return { type: "any" };
  }
}
