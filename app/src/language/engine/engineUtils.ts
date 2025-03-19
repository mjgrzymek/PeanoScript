import {
  removeNumberIndex,
  TypeTreeEq,
  type ArithmeticTree,
  type TaggedType,
  type TTreeField,
  type TypeTree,
} from "../engineTypes";
import { TypeAst, ExpressionAst, StatementAst, KW } from "../parsing/astTypes";
import { unparseAst } from "../ui";
import { ExtraInfo, ActionInfo } from "../uiTypes";
import type { TypeContext } from "./compile";

export function retrieveFromContext(
  ctx: TypeContext,
  key: string
): TaggedType | undefined {
  if (Object.hasOwn(ctx, key)) {
    return ctx[key];
  }
  return undefined;
}
export function bigIntToSuccs(x: bigint): ArithmeticTree {
  if (x === 0n) {
    return { type: "zero" };
  }
  return {
    type: "succ",
    value: bigIntToSuccs(x - 1n),
  };
}
export function makeTagged(t: TypeTree): TaggedType {
  if (
    t.type === "*" ||
    t.type === "var" ||
    t.type === "zero" ||
    t.type === "succ" ||
    t.type === "+"
  ) {
    return { kind: "arithmetic", value: t };
  }
  if (
    t.type === "&&" ||
    t.type === "||" ||
    t.type === "==" ||
    t.type === "rung" ||
    t.type === "never" ||
    t.type === "any" ||
    t.type === "t=>" ||
    t.type === "tstruct"
  ) {
    return { kind: "proof", value: t };
  }
  if (t.type === "N") {
    throw new Error("Only use N as a function parameter type or in a struct");
  }
  if (t.type === "typevar") {
    throw new Error("makeTagged: typevar should not be tagged");
  }
  const _: never = t.type;
  throw new Error(`makeTagged: unknown type ${t.type}`);
}
export function unparseType(ast: TypeTree | TTreeField | undefined): string {
  if (typeof ast === "undefined") {
    return "Any";
  }
  if (ast.type === "any") {
    return "any";
  }

  if (ast.type === "t=>") {
    if (ast.right.type === "never" && ast.left.type !== "N") {
      if (ast.left.type === "==") {
        return `(${unparseType(ast.left.left)} != ${unparseType(
          ast.left.right
        )})`;
      }
      return `!( ${unparseType(ast.left)} )`;
    }
    return `(${ast.leftName}: ${unparseType(ast.left)}) => ${unparseType(
      ast.right
    )}`;
  }
  if (ast.type === "tfield") {
    return `${ast.left}: ${unparseType(ast.right)}`;
  }
  if (ast.type === "tstruct") {
    return `{${ast.value.map(unparseType).join("; ")}}`;
  }
  if (ast.type === "var") {
    return ast.value;
  }
  if (ast.type === "zero") {
    return "0";
  }
  if (ast.type === "succ") {
    const num = arithToMaybeNumber(ast);
    if (num !== undefined) {
      return num.toString();
    }
    return `succ(${unparseType(ast.value)})`;
  }
  if (ast.type === "N") {
    return "N";
  }
  if (ast.type === "rung") {
    return `rung<${unparseType(ast.value)}>`;
  }
  if (ast.type === "never") {
    return "never";
  }
  if (ast.type === "typevar") {
    return ast.value;
  }

  if (
    ast.type !== "+" &&
    ast.type !== "*" &&
    ast.type !== "||" &&
    ast.type !== "&&" &&
    ast.type !== "=="
  ) {
    const _: never = ast.type;
    throw new Error(`unparse: unknown type ${ast.type}`);
  }

  return `(${unparseType(ast.left)} ${ast.type} ${unparseType(ast.right)})`;
} 
export function arithToMaybeNumber(x: ArithmeticTree): bigint | undefined {
  if (x.type === "succ") {
    const inner = arithToMaybeNumber(x.value);
    if (inner === undefined) {
      return undefined;
    }
    return inner + 1n;
  }
  if (x.type === "zero") {
    return 0n;
  }
  return undefined;
}
export function freeInType(name: string, ast: TypeTree): boolean {
  if (ast.type === "var") {
    return ast.value === name;
  }
  if (ast.type === "typevar") {
    return ast.value === name;
  }
  if (ast.type === "t=>") {
    return (
      ast.leftName !== name && // TODO maybe bug when it shadows like (p: p == 0)
      (freeInType(name, ast.left) || freeInType(name, ast.right))
    );
  }
  if (ast.type === "tstruct") {
    // TODO maybe bad when value[0] is not the one
    return ast.value[0].left !== name && freeInType(name, ast.value[1].right);
  }
  if (ast.type === "succ") {
    return freeInType(name, ast.value);
  }
  if (ast.type === "zero") {
    return false;
  }
  if (ast.type === "N") {
    return false;
  }
  if (ast.type === "never") {
    return false;
  }
  if (ast.type === "rung") {
    return freeInType(name, ast.value);
  }
  if (ast.type === "any") {
    return false;
  }
  if (
    ast.type === "==" ||
    ast.type === "||" ||
    ast.type === "&&" ||
    ast.type === "+" ||
    ast.type === "*"
  ) {
    return freeInType(name, ast.left) || freeInType(name, ast.right);
  }
  const _: never = ast.type;
  throw new Error(`unparse: unknown type ${ast.type}`);
} // find new name that's free in all of tt

export function freeify(s: string, tt: TypeTree[]): string {
  const shaved = removeNumberIndex(s);
  let i = 2;
  while (true) {
    const newName = `${shaved}_${i}`;
    if (!tt.some((t) => freeInType(newName, t))) {
      return newName;
    }
    i++;
  }
}
export function rewriteType(
  ast: TypeTree,
  from: string,
  to: TypeTree
): TypeTree {
  if (ast.type === "var") {
    return ast.value === from ? to : ast;
  }
  if (ast.type === "typevar") {
    return ast.value === from ? to : ast;
  }
  if (ast.type === "tstruct") {
    if (ast.value.length !== 2) {
      throw new Error("unimplemented struct with length != 2");
    }
    if (ast.value[0].right.type !== "N") {
      throw new Error("unimplemented struct with first field not N");
    }
    const varname = ast.value[0].left;
    if (varname === from) {
      return ast;
    }
    if (freeInType(varname, to)) {
      const newVarname = freeify(varname, [
        to,
        ast.value[1].right,
        { type: "var", value: ast.value[1].left },
      ]);

      return {
        type: "tstruct",
        value: [
          {
            type: "tfield",
            left: newVarname,
            right: { type: "N" },
          },
          {
            type: "tfield",
            left: ast.value[1].left,
            right: rewriteType(
              rewriteType(ast.value[1].right, varname, {
                type: "var",
                value: newVarname,
              }),
              from,
              to
            ),
          },
        ],
      };
    }
    return {
      type: "tstruct",
      value: [
        ast.value[0],
        {
          type: "tfield",
          left: ast.value[1].left,
          right: rewriteType(ast.value[1].right, from, to),
        },
      ],
    };
  }
  if (ast.type === "t=>") {
    if (ast.left.type === "N") {
      if (ast.leftName === from) {
        return ast;
      }
      if (freeInType(ast.leftName, to)) {
        const newVarname = freeify(ast.leftName, [to, ast.right]);
        return {
          type: "t=>",
          leftName: newVarname,
          left: { type: "N" },
          right: rewriteType(
            rewriteType(ast.right, ast.leftName, {
              type: "var",
              value: newVarname,
            }),
            from,
            to
          ),
        };
      }
      return {
        type: "t=>",
        leftName: ast.leftName,
        left: { type: "N" },
        right: rewriteType(ast.right, from, to),
      };
    }
    return {
      // TODO um maybe it's bad overwriting even if it's prop
      type: "t=>",
      leftName: ast.leftName,
      left: rewriteType(ast.left, from, to),
      right: rewriteType(ast.right, from, to),
    };
  }
  if (ast.type === "&&" || ast.type === "||") {
    return {
      type: ast.type,
      left: rewriteType(ast.left, from, to),
      right: rewriteType(ast.right, from, to),
    };
  }
  if (ast.type === "*" || ast.type === "+") {
    return {
      type: ast.type,
      left: rewriteType(ast.left, from, to) as ArithmeticTree,
      right: rewriteType(ast.right, from, to) as ArithmeticTree,
    };
  }
  if (ast.type === "==") {
    return {
      type: ast.type,
      left: rewriteType(ast.left, from, to) as ArithmeticTree,
      right: rewriteType(ast.right, from, to) as ArithmeticTree,
    };
  }
  if (ast.type === "succ") {
    return {
      type: "succ",
      value: rewriteType(ast.value, from, to) as ArithmeticTree,
    };
  }
  if (ast.type === "rung") {
    return {
      type: "rung",
      value: rewriteType(ast.value, from, to) as TypeTreeEq,
    };
  }
  if (ast.type === "N") {
    return ast;
  }
  if (ast.type === "zero") {
    return ast;
  }
  if (ast.type === "never") {
    return ast;
  }
  if (ast.type === "any") {
    return ast;
  }
  const _: never = ast.type;
  throw new Error(`rewriteType: unknown type ${ast.type}`);
}
export function postError(
  extra: ExtraInfo[] | undefined,
  ast: TypeAst | ExpressionAst | StatementAst | KW,
  err: unknown,
  actionInfo: ActionInfo | undefined = undefined
) {
  const msg =
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
      ? err.message
      : "weird error1";
  if (!ast.meta) {
    console.log(
      "empty statement list somewhere? idk what to do deal with it",
      "%",
      ast.type === "KW" ? ast.value : unparseAst(ast),
      "%",
      JSON.stringify(ast),
      ast.type,
      msg
    );
  } else {
    extra?.push({
      infoType: "error",
      errorText: msg,
      meta: ast.meta,
      actionInfo,
    });
  }
}
