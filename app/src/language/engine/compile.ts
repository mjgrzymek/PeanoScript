import { ExtraInfo, LogInfoValue, ReturnMethod } from "../uiTypes";
import {
  ArithmeticTree,
  TaggedType,
  TTreeStruct,
  TypeTree,
} from "../engineTypes";
import { safeParseStatements } from "../parsing/parse";
import { axioms, axiomsImpl } from "../axioms";
import { identitiesEquivalent } from "../library/equalityPolynomials";
import { unparseAst } from "../ui";
import { ExpressionAst, Switch } from "../parsing/astTypes";
import { ExerciseRequirements } from "../../docData/codeExamples";
import { typeAstToTypeTree } from "./typeAstToTypeTree";
import { string2Type } from "./string2Type";
import {
  bigIntToSuccs,
  makeTagged,
  postError,
  retrieveFromContext,
  rewriteType,
  unparseType,
} from "./engineUtils";
import { freeInType } from "./engineUtils";

// TODO rename to assignable
function typeEquals(a: TypeTree, b: TypeTree): boolean {
  if (a.type === "any" || b.type === "any") {
    return true;
  }
  if (a.type === "rung" || b.type === "rung") {
    const innerA = a.type === "rung" ? a.value : a;
    const innerB = b.type === "rung" ? b.value : b;
    if (innerA.type !== "==" || innerB.type !== "==") {
      return false;
    }
    return identitiesEquivalent(innerA, innerB);
  }
  if (a.type === "var") {
    return b.type === "var" && a.value === b.value;
  }
  if (a.type === "typevar" || b.type === "typevar") {
    throw new Error("typeEquals: typevar should not be compared");
  }
  if (a.type === "zero") {
    return b.type === "zero";
  }
  if (a.type === "N") {
    return b.type === "N";
  }
  if (a.type === "succ") {
    return b.type === "succ" && typeEquals(a.value, b.value);
  }
  if (
    a.type == "||" ||
    a.type == "&&" ||
    a.type == "==" ||
    a.type == "+" ||
    a.type == "*"
  ) {
    if (b.type != a.type) return false;
    return typeEquals(a.left, b.left) && typeEquals(a.right, b.right);
  }
  if (a.type === "t=>") {
    if (b.type !== "t=>") return false;
    if (!typeEquals(a.left, b.left)) return false;
    if (a.leftName === b.leftName) return typeEquals(a.right, b.right);
    if (freeInType(a.leftName, b.right)) return false;
    return typeEquals(
      a.right,
      rewriteType(b.right, b.leftName, { type: "var", value: a.leftName })
    );
  }
  if (a.type === "tstruct") {
    // TODO this is a hack, but otherwise stuff doesn't work like renaming in generic types
    if (b.type !== "tstruct") return false;
    if (
      !(
        a.value.length === 2 &&
        b.value.length === 2 &&
        b.value[0].right.type === "N" &&
        a.value[0].right.type === "N"
      )
    ) {
      throw new Error(
        "structs must be of the form {name : N, name2: phi<name> }"
      );
    }
    if (a.value[0].left === b.value[0].left) {
      return typeEquals(a.value[1].right, b.value[1].right);
    }
    if (freeInType(a.value[0].left, b.value[1].right)) {
      return false;
    }
    return typeEquals(
      a.value[1].right,
      rewriteType(b.value[1].right, b.value[0].left, {
        type: "var",
        value: a.value[0].left,
      })
    );
  }
  if (a.type === "never") {
    return b.type === "never";
  }
  const _: never = a.type;
  throw new Error(`typeEquals: unknown type ${a.type}`);
}

function reduceType(func: TypeTree, arg: TypeTree): TypeTree {
  if (func.type !== "t=>") {
    throw new Error(`reduceType: ${func} is not a function`);
  }
  if (func.left.type === "N") {
    if (makeTagged(arg).kind !== "arithmetic") {
      throw new Error(
        `reduceType: expected arithmetic, got ${unparseType(arg)}`
      );
    }
    return rewriteType(func.right, func.leftName, arg);
  }
  if (!typeEquals(func.left, arg)) {
    throw new Error(
      `type mismatch
requested: ${unparseType(func.left)}
received: ${unparseType(arg)}`
    );
  }
  return func.right;
}

type propObject =
  | {
      left: propObject;
      right: propObject;
    }
  | ((arg: propObject) => Promise<propObject>)
  | { left: propObject }
  | { right: propObject }
  | { num: bigint; prop: propObject }
  | "(never)"
  | "(eq)"
  | "(sorry)"
  | never
  | bigint;

function obj2str(obj: propObject, t: TypeTree): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t3: any = t;
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (typeof obj === "string") {
    return obj;
  }
  if (typeof obj === "function") {
    return "(func)";
  }
  if ("left" in obj && "right" in obj) {
    return `{left: ${obj2str(obj.left, t3?.left)}, right: ${obj2str(
      obj.right,
      t3?.right
    )}}`;
  }
  if ("left" in obj) {
    return `{left: ${obj2str(obj.left, t3?.left)}}`;
  }
  if ("right" in obj) {
    return `{right: ${obj2str(obj.right, t3?.right)}}`;
  }
  if ("num" in obj) {
    const t2: TTreeStruct = t3;
    let numName = "@num";
    let propName = "@prop";
    let propType = undefined;
    if (t2.type === "tstruct" && t2?.value) {
      for (const field of t2.value) {
        if (field.right.type === "N") {
          numName = field.left;
        } else {
          propName = field.left;
          propType = field.right;
        }
      }
    }
    return `{${numName}: ${obj.num}, ${propName}: ${obj2str(
      obj.prop,
      propType!
    )}}`;
  }
  const _: never = obj;
  throw new Error(`obj2str: unknown object ${JSON.stringify(obj)}`);
}

export type TypeContext = Record<string, TaggedType>;
export type ImplContext = Record<string, propObject>;
type ImplContinuation = (ctx: ImplContext) => Promise<propObject>;
type TypeAndImpl = { type: TypeTree; impl: ImplContinuation };

const eq0CheckType = string2Type("(x: N) => x == 0 || x != 0");
const check0revType = string2Type("(x: N) => 0 == x || 0 != x");
const eqCheckType = string2Type("(x : N) => (y : N) => x == y || x != y");
const previngType = string2Type(
  "(n: N) => (nonZero: n != 0) => {prevN: N; isPrev: succ(prevN) ==  n}"
);
export type CompilerOptions = {
  hardcodedImpls: boolean;
};

export type ExerciseResult = {
  sorryUsed: boolean;
  varDefined: boolean;
  varCorrectlyTyped: boolean;
};
export type ExerciseIO = Readonly<ExerciseRequirements> & ExerciseResult;
export type InterpreterKillSwitch = { kill: boolean };
export function getType(
  ast: ExpressionAst,
  typeContext: TypeContext,
  require: TypeTree | undefined = undefined,
  stuff: {
    extra: ExtraInfo[] | undefined;
    compilerOptions: CompilerOptions | undefined;
    exerciseIO?: ExerciseIO;
    interpreterKillSwitch?: InterpreterKillSwitch;
  } = { extra: undefined, compilerOptions: undefined },
  returnMethod: ReturnMethod = "value"
): TypeAndImpl {
  const { extra, compilerOptions } = stuff;
  if (ast.type === "statements" && returnMethod === "value") {
    returnMethod = "return";
  }
  extra?.push({
    infoType: "required",
    requirement: unparseType(require),
    meta: ast.meta,
    returnMethod,
  });

  function rGetType(
    ast: ExpressionAst,
    context: TypeContext,
    require: TypeTree | undefined,
    returnMethod2: ReturnMethod = "value"
  ): TypeAndImpl {
    let ret: TypeTree = { type: "any" };
    let impl: ImplContinuation = async () => {
      throw new Error("couldn't create implementation: type error");
    };
    try {
      const thing = getType(ast, context, require, stuff, returnMethod2);
      ret = thing.type;
      impl = thing.impl;
      if (require !== undefined && !typeEquals(ret, require)) {
        throw new Error(
          `type
${unparseType(ret)}
is not assignable to type
${unparseType(require)}`
        );
      }
    } catch (err) {
      postError(extra, ast, err);
    }
    const type = require ? require : ret;
    if (
      compilerOptions?.hardcodedImpls &&
      ast.type !== "identifier" &&
      type.type === "t=>"
    ) {
      if (typeEquals(type, eq0CheckType)) {
        impl = async () => async (x) =>
          x == 0n ? { left: "(eq)" } : { right: async () => "(never)" };
      } else if (typeEquals(type, check0revType)) {
        impl = async () => async (x) => x == 0n ? { left: x } : { right: x };
      } else if (typeEquals(type, eqCheckType)) {
        impl = async () => async (x) => async (y) =>
          x == y ? { left: "(eq)" } : { right: async () => "(never)" };
      } else if (typeEquals(type, previngType)) {
        impl = async () => async (n) => async () => {
          if (n == 0n) {
            throw new Error("neverElim should never be called");
          }
          return { num: (n as bigint) - 1n, prop: "(eq)" };
        };
      } else {
        let fundepth = 0;
        let type2: TypeTree = type;
        while (type2.type === "t=>") {
          fundepth++;
          type2 = type2.right;
        }
        let helpimpl: propObject = "(eq)";
        if (type2.type === "==") {
          helpimpl = "(eq)";
          for (let i = 0; i < fundepth; i++) {
            helpimpl = async () => helpimpl;
          }
          impl = async () => helpimpl;
        }
      }
    }
    return { type, impl };
  }
  function getSwitchType(
    ast: Switch,
    caseReturnMethod: ReturnMethod
  ): TypeAndImpl {
    const { type: valType, impl: valImpl } = rGetType(
      ast.value,
      typeContext,
      undefined
    );
    if (valType.type === "any") {
      return {
        type: { type: "any" },
        impl: () => {
          throw new Error("got any in switch");
        },
      };
    }
    if (typeof valType !== "object" || valType.type !== "||") {
      throw new Error(`switch value must be ||, got ${unparseType(valType)}`);
    }
    const cases = ast.cases;
    if (cases.length !== 2) {
      throw new Error("switch must have 2 cases");
    }
    const leftCase = cases.filter((c) => c.left.left.value === "left")[0];
    if (leftCase === undefined) {
      throw new Error("switch must have a left case");
    }
    const rightCase = cases.filter((c) => c.left.left.value === "right")[0];
    if (rightCase === undefined) {
      throw new Error("switch must have a right case");
    }
    let require2 = require;
    const leftVarName = leftCase.left.right.value;
    const rightVarName = rightCase.left.right.value;
    extra?.push({
      infoType: "var defined",
      varType: unparseType(valType.left),
      varName: leftVarName,
      meta: leftCase.right.meta,
    });
    extra?.push({
      infoType: "var defined",
      varType: unparseType(valType.right),
      varName: rightVarName,
      meta: rightCase.right.meta,
    });
    extra?.push({
      infoType: "var hover",
      varInfo: leftCase.left.right.meta,
      type: unparseType(valType.left),
    });
    extra?.push({
      infoType: "var hover",
      varInfo: rightCase.left.right.meta,
      type: unparseType(valType.right),
    });
    const { type: leftType, impl: leftImpl } = rGetType(
      leftCase.right,
      {
        ...typeContext,
        [leftVarName]: { kind: "proof", value: valType.left },
      },
      require2,
      caseReturnMethod
    );
    if (require2 === undefined) {
      require2 = leftType;
    }
    const { type: rightType, impl: rightImpl } = rGetType(
      rightCase.right,
      {
        ...typeContext,
        [rightVarName]: { kind: "proof", value: valType.right },
      },
      require2,
      caseReturnMethod
    );
    if (
      !typeEquals(leftType, rightType) ||
      (require !== undefined && !typeEquals(leftType, require))
    ) {
      throw new Error("switch cases must have same type and also with require");
    }
    return {
      type: leftType,
      impl: async (ctx) => {
        const val = await valImpl(ctx);
        if (
          !(
            typeof val === "object" &&
            (("left" in val && !("right" in val)) ||
              ("right" in val && !("left" in val)))
          )
        ) {
          throw new Error("switch impl got neither left nor right");
        }
        if ("left" in val) {
          return await leftImpl({ ...ctx, [leftVarName]: val.left });
        }
        if ("right" in val) {
          return await rightImpl({ ...ctx, [rightVarName]: val.right });
        }
        const _: never = val;
        throw new Error("something wrong in switch");
      },
    };
  }

  function getEqMapType(
    mapfAst: ExpressionAst,
    eqAst: ExpressionAst
  ): TypeAndImpl {
    const mapf = mapfAst;
    let mapfT: TypeTree;
    if (mapf.type === "identifier" && mapf.value === "succ") {
      mapfT = {
        type: "t=>",
        leftName: "x",
        left: { type: "N" },
        right: { type: "succ", value: { type: "var", value: "x" } },
      };
    } else {
      mapfT = rGetType(mapf, typeContext, undefined).type; // todo expect N => any to get x => f(x) syntax? (wo x:N)
      if (
        mapfT.type !== "t=>" ||
        makeTagged(mapfT.right).kind !== "arithmetic"
      ) {
        throw new Error("eq.map requires a function from N to N");
      }
    }
    const { type: eq, impl: _impl } = rGetType(eqAst, typeContext, undefined);
    if (!(eq.type === "==")) {
      throw new Error(`eq.map argument must be a ==`);
    }
    return {
      type: {
        type: "==",
        left: reduceType(mapfT, eq.left) as ArithmeticTree,
        right: reduceType(mapfT, eq.right) as ArithmeticTree,
      },
      impl: async () => "(eq)",
    };
  }
  if (ast.type === "identifier") {
    if (ast.value === "sorry") {
      extra?.push({
        infoType: "var hover",
        varInfo: ast.meta,
        type: require ? unparseType(require) : "any",
      });
      if (stuff.exerciseIO) {
        stuff.exerciseIO.sorryUsed = true;
      }
      return {
        type: { type: "any" },
        impl: async () => {
          return "(sorry)";
        },
      };
    }
    const ret = retrieveFromContext(typeContext, ast.value);
    if (ret === undefined) {
      throw new Error(`unknown variable ${ast}`);
    }
    if (ret.kind !== "proof" && ret.kind !== "arithmetic") {
      throw new Error(`can't use a type in expression context`);
    }
    extra?.push({
      infoType: "var hover",
      varInfo: ast.meta,
      type: unparseType(ret.value),
    });
    return {
      type: ret.value,
      impl: async (ctx) => {
        if (!Object.hasOwn(ctx, ast.value)) {
          throw new Error(
            `runtime error: variable ${ast.value} not in context`
          );
        }
        return ctx[ast.value];
      },
    };
  }
  if (ast.type === "num") {
    const num = BigInt(ast.value);
    return { type: bigIntToSuccs(num), impl: async () => num };
  }
  if (ast.type === "generic call") {
    // function generics are only built-in
    // for nats its already kinda generic
    // there could be functions like propositional logic but idk
    if (ast.left.value === "makeRight" || ast.left.value === "makeLeft") {
      if (ast.right.type !== "||") {
        throw new Error(`makeRight/right must be ||`);
      }
      const provided =
        ast.left.value === "makeRight" ? ast.right.right : ast.right.left;
      const side: "left" | "right" =
        ast.left.value === "makeRight" ? "right" : "left";
      return {
        type: {
          type: "t=>",
          leftName: "_",
          left: typeAstToTypeTree(provided, typeContext, extra),
          right: typeAstToTypeTree(ast.right, typeContext, extra),
        },
        impl: async () => async (p: propObject) =>
          ({ [side]: p } as { left: propObject } | { right: propObject }),
      };
    }

    if (ast.left.value === "neverElim") {
      const want = typeAstToTypeTree(ast.right, typeContext, extra);
      return {
        type: {
          type: "t=>",
          leftName: "_",
          left: { type: "never" },
          right: want,
        },
        impl: () => {
          throw new Error("neverElim should never be called");
        },
      };
    }
    if (ast.left.value === "replace") {
      if (ast.right.type !== "identifier") {
        throw new Error(`replace needs a generic type argument`);
      }
      const mot = retrieveFromContext(typeContext, ast.right.value);
      if (mot === undefined) {
        throw new Error(`unknown variable ${ast.right.value}`);
      }
      if (mot.kind !== "generic typedef") {
        throw new Error(`${ast.right.value} is not a generic typedef`);
      }
      if (mot.value.type !== "generic=>") {
        throw new Error(`${ast.right.value} is not a generic`);
      }
      if (mot.value.args.length !== 1) {
        throw new Error(`${ast.right.value} must have exactly 1 argument`);
      }
      const arg = mot.value.args[0];
      const body = mot.value.body;
      return {
        type: {
          type: "t=>",
          leftName: "L",
          left: { type: "N" },
          right: {
            type: "t=>",
            leftName: "R",
            left: { type: "N" },
            right: {
              type: "t=>",
              leftName: "eqLR",
              left: {
                type: "==",
                left: { type: "var", value: "L" },
                right: { type: "var", value: "R" },
              },
              right: {
                type: "t=>",
                leftName: "propOfL",
                left: rewriteType(body, arg.name, { type: "var", value: "L" }),
                right: rewriteType(body, arg.name, { type: "var", value: "R" }),
              },
            },
          },
        },
        impl:
          async () =>
          async () =>
          async () =>
          async () =>
          async (p: propObject) =>
            p,
      };
    }

    if (ast.left.value === "excludedMiddle") {
      const argType = typeAstToTypeTree(ast.right, typeContext, extra);
      return {
        type: {
          type: "||",
          left: argType,
          right: {
            type: "t=>",
            leftName: "_",
            left: argType,
            right: { type: "never" },
          },
        },
        impl: () => {
          throw new Error("excludedMiddle is not constructively valid");
        },
      };
    }
    throw new Error(`unkown generic`);
  }
  if (ast.type === "statements") {
    type ImplStatement =
      | { variant: "const"; varName: string; value: ImplContinuation }
      | {
          variant: "multi const";
          numName: string;
          propName: string;
          value: ImplContinuation;
        };
    const statementImpls: ImplStatement[] = [];
    let topImplCtx: () => Promise<ImplContext> = async () => axiomsImpl;
    async function updateCtx(
      ctx: ImplContext,
      st: ImplStatement
    ): Promise<ImplContext> {
      if (st.variant === "const") {
        return { ...ctx, [st.varName]: await st.value(ctx) };
      } else if (st.variant === "multi const") {
        const existsObj = await st.value(ctx);
        if (
          !(
            typeof existsObj === "object" &&
            "num" in existsObj &&
            typeof existsObj.num === "bigint" &&
            "prop" in existsObj
          )
        ) {
          throw new Error("runtime error: multi const didnt get object");
        }
        return {
          ...ctx,
          [st.numName]: existsObj.num,
          [st.propName]: existsObj.prop,
        };
      } else {
        const _: never = st;
      }
      throw new Error("runtime error: unknown statement variant");
    }
    function updateTopCtx(st: ImplStatement) {
      const topImplCtxCopy = topImplCtx;
      topImplCtx = async () => {
        const ret = await updateCtx(await topImplCtxCopy(), st);
        return ret;
      };
    }
    for (const statement of ast.value) {
      try {
        if (statement.type === "const") {
          const assertion = statement.assertion
            ? typeAstToTypeTree(statement.assertion, typeContext, extra)
            : undefined;
          const { type: rtype, impl: rimpl } = rGetType(
            statement.right,
            typeContext,
            assertion
          );
          const result = assertion ?? rtype;
          extra?.push({
            infoType: "var hover",
            varInfo: statement.left.meta,
            type: unparseType(rtype),
          });
          const st = {
            variant: "const",
            varName: statement.left.value,
            value: rimpl,
          } as const;
          if (!ast.topLevel) {
            extra?.push({
              infoType: "var defined",
              varName: statement.left.value,
              varType: unparseType(result),
              meta: { start: statement.meta.end, end: ast.meta.end },
            });
          } else {
            updateTopCtx(st);
          }
          typeContext = {
            ...typeContext,
            [statement.left.value]: makeTagged(result),
          };
          statementImpls.push(st);
        } else if (statement.type === "multi const") {
          const { type: rightType, impl: rimpl } = rGetType(
            statement.right,
            typeContext,
            undefined
          );
          if (rightType.type !== "tstruct") {
            throw new Error(
              `need a struct for destructuring assignment, got ${unparseType(
                rightType
              )}`
            );
          }
          const renames: { from: string; to: string }[] = [];
          const implAssign: {
            num: string | undefined;
            prop: string | undefined;
          } = { num: undefined, prop: undefined };
          for (const nameAssignment of statement.left) {
            const from = nameAssignment.from;
            const to = nameAssignment.to ?? from;
            let varType = rightType.value.find(
              (f) => f.left === from.value
            )?.right;
            if (varType === undefined) {
              throw new Error(
                `destructuring assignment failed, "${
                  from.value
                }" not in struct ${unparseType(rightType)}`
              );
            }
            if (varType.type === "N") {
              implAssign.num = to.value;
              varType = { type: "var", value: to.value };
              renames.push({ from: from.value, to: to.value });
            } else {
              implAssign.prop = to.value;
              for (const rename of renames) {
                varType = rewriteType(varType, rename.from, {
                  type: "var",
                  value: rename.to,
                });
              }
            }
            extra?.push({
              infoType: "var defined",
              varName: to.value,
              varType: unparseType(varType),
              meta: { start: statement.meta.end, end: ast.meta.end },
            });
            extra?.push({
              infoType: "var hover",
              varInfo: to.meta,
              type: unparseType(varType),
            });
            typeContext = {
              ...typeContext,
              [to.value]: makeTagged(varType),
            };
          }
          if (implAssign.num === undefined || implAssign.prop === undefined) {
            throw new Error(
              `destructuring assignment must get a number and a proposition`
            );
          }
          const st = {
            variant: "multi const",
            numName: implAssign.num,
            propName: implAssign.prop,
            value: rimpl,
          } as const;
          statementImpls.push(st);
          if (ast.topLevel) {
            updateTopCtx(st);
          }
        } else if (statement.type === "return" || statement.type === "switch") {
          const { type, impl: retImpl } =
            statement.type === "return"
              ? rGetType(statement.value, typeContext, require)
              : getSwitchType(statement, returnMethod);
          if (
            statement.type === "return" &&
            statement.kind.value !== returnMethod
          ) {
            postError(
              extra,
              statement.kind,
              {
                message: `This block should end in a ${returnMethod} statement, got "${statement.kind.value}"`,
              },
              { type: "replaceWith", value: returnMethod }
            );
          }
          return {
            type,
            impl: async (ctx) => {
              for (const st of statementImpls) {
                ctx = await updateCtx(ctx, st);
              }
              return retImpl(ctx);
            },
          };
        } else if (statement.type === "typedef") {
          typeContext = {
            ...typeContext,
            [statement.left.value]: {
              kind: "typedef",
              value: typeAstToTypeTree(statement.right, typeContext, extra),
            },
          };
        } else if (statement.type === "generic typedef") {
          let extraContext: TypeContext = {};
          for (const param of statement.parameters) {
            if (
              param.constraint.value !== "N" &&
              param.constraint.value !== "Prop"
            ) {
              throw new Error(`generic typedef parameter must be N or Prop`);
            }
            extraContext = {
              ...extraContext,
              [param.name.value]:
                param.constraint.value === "N"
                  ? {
                      kind: "typedef",
                      value: { type: "var", value: param.name.value },
                    }
                  : {
                      kind: "typedef",
                      value: { type: "typevar", value: param.name.value },
                    },
            };
          }
          const value = typeAstToTypeTree(
            statement.value,
            {
              ...typeContext,
              ...extraContext,
            },
            extra
          );
          typeContext = {
            ...typeContext,
            [statement.name.value]: {
              kind: "generic typedef",
              value: {
                type: "generic=>",
                args: statement.parameters.map((p) => ({
                  name: p.name.value,
                  constraint: p.constraint.value as "N" | "Prop",
                })),
                body: value,
              },
            },
          };
        } else if (statement.type === "empty statement") {
          continue;
        } else if (statement.type === "console.log") {
          for (const printVal of statement.value) {
            const outPromise = (async (): Promise<LogInfoValue> => {
              try {
                if (!ast.topLevel) {
                  throw new Error(
                    "console.log only works at the top level of code"
                  );
                }
                const { type: argType, impl: argImpl } = rGetType(
                  printVal,
                  typeContext,
                  undefined
                );
                const val = await argImpl(await topImplCtx());
                const value = obj2str(val, argType);
                return { value, logType: "output" };
              } catch (err) {
                const msg = err instanceof Error ? err.message : "weird error";
                return { value: msg, logType: "error" };
              }
            })();
            const counterHolder = { counter: 0 };
            const counterInterval = setInterval(() => {
              counterHolder.counter += 1;
            }, 1000);
            (async () => {
              await outPromise;
              clearInterval(counterInterval);
            })();
            extra?.push({
              infoType: "log",
              outPromise,
              meta: statement.meta,
              counterHolder,
            });
          }
        } else {
          const _: never = statement;
          throw new Error(`unexpected statement ${unparseAst(statement)}`);
        }
        if (ast.topLevel && stuff.exerciseIO) {
          const varType = retrieveFromContext(
            typeContext,
            stuff.exerciseIO.varName
          );
          if (varType === undefined) {
            stuff.exerciseIO.varDefined = false;
          } else {
            stuff.exerciseIO.varDefined = true;
            stuff.exerciseIO.varCorrectlyTyped =
              varType.kind === "proof" &&
              typeEquals(varType.value, stuff.exerciseIO.varType);
          }
        }
      } catch (err) {
        postError(extra, statement, err);
      }
    }
    if (ast.topLevel) {
      return { type: { type: "any" }, impl: async () => 1337n };
    }
    throw new Error(`statement must end in a ${returnMethod}`);
  }
  if (ast.type === "e=>") {
    let rightRequire: TypeTree | undefined = undefined;
    let left: TypeTree | undefined = ast.left
      ? typeAstToTypeTree(ast.left, typeContext, extra)
      : undefined;
    if (require !== undefined) {
      if (require.type !== "t=>") {
        throw new Error(`required non-function type ${unparseType(require)}`);
      }
      if (left !== undefined && !typeEquals(require.left, left)) {
        throw new Error(
          `required input type: ${unparseType(
            require.left
          )}, declared: ${unparseType(left)}`
        );
      }
      if (
        require.left.type === "N" &&
        require.leftName !== ast.leftName.value
      ) {
        require = {
          type: "t=>",
          leftName: ast.leftName.value,
          left: require.left,
          right: rewriteType(require.right, require.leftName, {
            type: "var",
            value: ast.leftName.value,
          }),
        };
      }
      rightRequire = require.right;
      left ??= require.left;
    }

    // left ??= "N";
    if (left === undefined) {
      throw new Error("unconstrained argument type"); // TODO on arg only?
    }

    const natty = left.type === "N";

    if (ast.assertion !== undefined) {
      const assn = typeAstToTypeTree(
        ast.assertion,
        natty
          ? {
              ...typeContext,
              [ast.leftName.value]: {
                kind: "arithmetic",
                value: { type: "var", value: ast.leftName.value },
              },
            }
          : typeContext,
        extra
      );
      if (rightRequire !== undefined) {
        if (!typeEquals(rightRequire, assn)) {
          throw new Error(`return type annotation inconsistent with expected type.
asserted here: ${unparseType(assn)}
expected return type: ${unparseType(rightRequire)}`);
        }
      }
      rightRequire = assn;
    }

    const leftName = ast.leftName.value;
    const ltype = natty
      ? ({ type: "var", value: ast.leftName.value } as const)
      : left;
    extra?.push({
      infoType: "var defined",
      varName: leftName,
      varType: unparseType(ltype),
      meta: ast.right.meta,
    });
    extra?.push({
      infoType: "var hover",
      varInfo: ast.leftName.meta,
      type: unparseType(ltype),
    });
    const { type: rightType, impl: rightImpl } = rGetType(
      ast.right,
      {
        ...typeContext,
        [ast.leftName.value]: makeTagged(ltype),
      },
      rightRequire,
      ast.right.type === "statements" ? "return" : "value"
    );
    if (rightRequire !== undefined && !typeEquals(rightType, rightRequire)) {
      throw new Error(`return type annotation breaks requirement
declared in function: ${unparseType(rightType)}
required: ${unparseType(rightRequire)}`);
    }
    return {
      type: {
        type: "t=>",
        leftName,
        left,
        right: rightType,
      },
      impl: async (ctx) => (val: propObject) => {
        return rightImpl({ ...ctx, [leftName]: val });
      },
    };
  }
  if (ast.type === "call") {
    if (
      ast.left.type === "." &&
      (ast.left.right.value === "symm" || ast.left.right.value === "sym")
    ) {
      if (ast.right !== "empty call") {
        throw new Error("symm takes no arguments");
      }
      const { type: ltype, impl: _limpl } = rGetType(
        ast.left.left,
        typeContext,
        require && require.type === "=="
          ? { type: "==", left: require.right, right: require.left }
          : undefined
      );
      if (ltype.type !== "==") {
        throw new Error(
          `.symm can only be called on an equality, got "${unparseType(ltype)}"`
        );
      }
      return {
        type: {
          type: "==",
          left: ltype.right,
          right: ltype.left,
        },
        impl: async () => "(eq)",
      };
    }
    if (ast.left.type === "." && ast.left.right.value === "trans") {
      const { type: ltype, impl: _limpl } = rGetType(
        ast.left.left,
        typeContext,
        undefined
      );
      if (ltype.type !== "==") {
        throw new Error(
          `.trans can only be called on an equality, got "${unparseType(
            ltype
          )}"`
        );
      }
      if (ast.right === "empty call") {
        throw new Error(`.trans required an argument`);
      }
      const { type: rtype, impl: _rimpl } = rGetType(
        ast.right,
        typeContext,
        require && require.type === "==" && typeEquals(require.left, ltype.left)
          ? { type: "==", left: ltype.right, right: require.right }
          : undefined
      );
      if (rtype.type === "==") {
        if (!typeEquals(ltype.right, rtype.left)) {
          throw new Error(
            `in eq1.trans(eq2), the right side of eq1 must match the left side of eq2. Got eq1=${unparseType(
              ltype
            )} and eq2=${unparseType(rtype)}`
          );
        }
        return {
          type: {
            type: "==",
            left: ltype.left,
            right: rtype.right,
          },
          impl: async () => "(eq)",
        };
      } else if (rtype.type === "rung") {
        if (require) {
          if (require.type !== "==") {
            throw new Error(
              `required type is not an equality, eq.trans doesn't make sense here. Required: ${unparseType(
                require
              )}`
            );
          } else {
            const wantedArgType = {
              type: "==",
              left: ltype.right,
              right: require.right,
            } as const;
            if (!typeEquals(wantedArgType, rtype)) {
              throw new Error(
                `wrong type, expected ${unparseType(
                  wantedArgType
                )}, got ${unparseType(rtype)}`
              );
            }
            return {
              type: require,
              impl: async () => "(eq)",
            };
          }
        } else {
          throw new Error(
            `.trans can only be called with a rung value if there is a type expectation. Add a type annotation or "as", or use an equality as the argument.`
          );
        }
      } else {
        throw new Error(
          `eq.trans can only be called with another equality, got "${unparseType(
            rtype
          )}"`
        );
      }
    }
    if (
      ast.left.type === "." &&
      (ast.left.right.value === "map" || ast.left.right.value === "congr")
    ) {
      if (ast.right === "empty call") {
        throw new Error("eq.map requires an argument");
      }
      return getEqMapType(ast.right, ast.left.left);
    }
    if (
      ast.right === "empty call" &&
      ast.left.type === "identifier" &&
      ast.left.value === "ring"
    ) {
      return {
        type: {
          type: "rung",
          value: {
            type: "==",
            left: { type: "zero" },
            right: { type: "zero" },
          },
        },
        impl: async () => "(eq)",
      };
    }
    if (ast.right === "empty call") {
      throw new Error(`no-argument call only works on built-in functions`);
    }
    if (ast.left.type === "identifier" && ast.left.value === "succ") {
      const { type: argType, impl: argImpl } = rGetType(
        ast.right,
        typeContext,
        undefined
      );
      if (makeTagged(argType).kind !== "arithmetic") {
        throw new Error(
          `succ argument must be an arithmetic type, got ${unparseType(
            argType
          )}`
        );
      }
      return {
        type: {
          type: "succ",
          value: argType as ArithmeticTree,
        },
        impl: async (ctx) => {
          const arg = await argImpl(ctx);
          if (typeof arg !== "bigint") {
            throw new Error("runtime error: succ impl got non-integer");
          }
          return arg + 1n;
        },
      }; // TODO except N (?)
    }

    if (ast.left.type === "identifier" && ast.left.value === "makeLeft") {
      if (require === undefined) {
        throw new Error("makeLeft needs an assertion or a type parameter");
      }
      if (require.type !== "||") {
        throw new Error(`makeLeft needs a || assertion, got ${require.type}`);
      }
      const { type: valueType, impl } = rGetType(
        ast.right,
        typeContext,
        require.left
      );
      if (!typeEquals(valueType, require.left)) {
        throw new Error("makeLeft type mismatch");
      }
      return {
        type: require,
        impl: async (ctx) => ({ left: await impl(ctx) }),
      };
    }
    if (ast.left.type === "identifier" && ast.left.value === "makeRight") {
      if (require === undefined) {
        throw new Error("makeRight needs an assertion or a type parameter");
      }
      if (require.type !== "||") {
        throw new Error(`makeRight needs a || assertion, got ${require.type}`);
      }
      const { type: valueType, impl } = rGetType(
        ast.right,
        typeContext,
        require.right
      );
      if (!typeEquals(valueType, require.right)) {
        throw new Error("makeRight type mismatch");
      }
      return {
        type: require,
        impl: async (ctx) => ({
          right: await impl(ctx),
        }),
      };
    }

    if (
      ast.left.type === "call" &&
      ast.left.right !== "empty call" &&
      ast.left.left.type === "identifier" &&
      ast.left.left.value === "eqMap"
    ) {
      return getEqMapType(ast.left.right, ast.right);
    }
    if (ast.left.type === "identifier" && ast.left.value === "ring") {
      const { type: r, impl } = rGetType(ast.right, typeContext, undefined);
      if (r.type === "any") {
        return { type: { type: "any" }, impl: async () => "(eq)" };
      }
      if (r.type !== "==") {
        throw new Error(`ring argument must be a ==, got ${unparseType(r)}`);
      }
      return { type: { type: "rung", value: r }, impl };
    }
    if (ast.left.type === "identifier" && ast.left.value === "neverElim") {
      if (require === undefined) {
        throw new Error("neverElim needs require or generic argument");
      }
      const { type: r, impl: _ } = rGetType(ast.right, typeContext, {
        type: "never",
      });
      if (!typeEquals(r, { type: "never" })) {
        throw new Error("neverElim needs never");
      }
      return {
        type: require,
        impl: () => {
          throw new Error("runtime error: neverElim should never be called");
        },
      };
    }
    if (
      ast.left.type === "call" &&
      ast.left.right !== "empty call" &&
      ast.left.left.type === "identifier" &&
      ast.left.left.value === "replaceAll"
    ) {
      const eqAst = ast.right;
      const propAst = ast.left.right;
      const { type: eq, impl: _eqImpl } = rGetType(
        eqAst,
        typeContext,
        undefined
      );
      if (eq.type !== "==") {
        throw new Error(
          `the second argument to replaceAll must be an equality`
        );
      }
      if (eq.left.type !== "var") {
        throw new Error(`replaceAll: left of eq must be a variable`);
      }
      const { type: prop, impl: propImpl } = rGetType(
        propAst,
        typeContext,
        undefined
      );
      return {
        type: rewriteType(prop, eq.left.value, eq.right),
        impl: propImpl,
      };
    }
    const { type: l, impl: lImpl } = rGetType(ast.left, typeContext, undefined);
    if (l.type === "any") {
      return {
        type: { type: "any" },
        impl: () => {
          throw new Error("can't call any");
        },
      };
    }
    if (l.type !== "t=>") {
      throw new Error(
        `getType: left of call must be a function. Got a ${unparseType(l)}`
      );
    }
    const { type: rType, impl: rImpl } = rGetType(
      ast.right,
      typeContext,
      l.left.type === "N" ? undefined : l.left
    );
    return {
      type: reduceType(l, rType),
      impl: async (ctx) => {
        const lVal = await lImpl(ctx);
        const rVal = await rImpl(ctx);
        if (!(typeof lVal === "function")) {
          throw new Error("left of call must be a function");
        }
        return lVal(rVal);
      },
    };
  }
  if (ast.type === "estruct") {
    if (require !== undefined && require.type !== "tstruct") {
      throw new Error(`didnt want a struct, wanted ${unparseType(require)}`);
    }
    const fields = ast.value;
    if (fields.length !== 2) {
      throw new Error("unimplemented, need {} to be two fields");
    }
    // need: rewrite type with value -> x
    // note: arit expressions are really only identifier, 0, succ, +, *
    // can only be in == or other arit
    // also, for as... I guess its P(val) typeEquals proof
    const [valueField, proofField] = fields;
    const valueName = valueField.left;
    const { type: valueType, impl: valueImpl } = rGetType(
      valueField.right,
      typeContext,
      undefined
    );
    const proofName = proofField.left;
    const unprocessedProofCode = proofField.right;
    let proofCode = unprocessedProofCode;

    let proofAssertion: TypeTree | undefined = undefined;
    if (require !== undefined) {
      const [requireValue, requireProof] = require.value;
      const requireValueName = requireValue.left;
      const requireProofName = requireProof.left;
      if (
        requireValueName !== valueName.value ||
        requireProofName !== proofName.value
      ) {
        throw new Error(
          `struct fields must match assertion. Received: ${valueName.value} ${proofName.value}, expected: ${requireValueName} ${requireProofName}`
        );
      }
      proofAssertion = requireProof.right;
    }

    if (unprocessedProofCode.type === "as") {
      const asProofAssertion = typeAstToTypeTree(
        unprocessedProofCode.right,
        {
          ...typeContext,
          [valueName.value]: {
            kind: "arithmetic",
            value: { type: "var", value: valueName.value },
          },
        },
        extra
      );
      if (
        proofAssertion !== undefined &&
        !typeEquals(proofAssertion, asProofAssertion)
      ) {
        throw new Error("as inconsistent with outer assertion in estruct");
      }
      proofAssertion = asProofAssertion;
      proofCode = unprocessedProofCode.left;
    }
    if (proofAssertion === undefined) {
      throw new Error("unimplemented, need proof assertion in estruct");
    }
    const proofAssertionOfValue = rewriteType(
      proofAssertion,
      valueName.value,
      valueType
    );
    const { type: proofType, impl: proofImpl } = rGetType(
      proofCode,
      typeContext,
      proofAssertionOfValue
    );
    if (!typeEquals(proofType, proofAssertionOfValue)) {
      throw new Error(
        `bad as: ${unparseType(proofType)} != ${unparseType(
          proofAssertionOfValue
        )}`
      );
    }

    return {
      type: {
        type: "tstruct",
        value: [
          { type: "tfield", left: valueName.value, right: { type: "N" } },
          { type: "tfield", left: proofName.value, right: proofAssertion },
        ],
      },
      impl: async (ctx) => {
        const num = await valueImpl(ctx);
        const prop = await proofImpl(ctx);
        if (typeof num !== "bigint") {
          throw new Error("runtime error: struct number field must be bigint");
        }
        if (typeof prop === "bigint") {
          throw new Error("runtime error: struct prop field must be prop");
        }
        return { num, prop };
      },
    };
  }
  if (ast.type === "e&&") {
    if (require !== undefined && require.type !== "&&") {
      throw new Error("didnt want a &&");
    }
    const { type: leftType, impl: leftImpl } = rGetType(
      ast.left,
      typeContext,
      require?.left
    );

    const { type: rightType, impl: rightImpl } = rGetType(
      ast.right,
      typeContext,
      require?.right
    );

    return {
      type: {
        type: "&&",
        left: leftType,
        right: rightType,
      },
      impl: async (ctx) => ({
        left: await leftImpl(ctx),
        right: await rightImpl(ctx),
      }),
    };
  }
  if (ast.type === "as") {
    const asRequire = typeAstToTypeTree(ast.right, typeContext, extra);
    if (require !== undefined && !typeEquals(require, asRequire)) {
      throw new Error(
        `as inconsistent with require, required: ${unparseType(
          require
        )}, got: ${unparseType(asRequire)}`
      );
    }
    const { type: l, impl } = rGetType(ast.left, typeContext, asRequire);
    if (!typeEquals(l, asRequire)) {
      throw new Error(`as inconsistent with left`);
    }
    return { type: asRequire, impl };
  }
  if (ast.type === ".") {
    const { type: lt, impl } = rGetType(ast.left, typeContext, undefined);
    if (lt.type !== "&&") {
      throw new Error(
        `Only equalities and && object have . , got ${unparseType(lt)}`
      );
    }
    const side = ast.right.value;
    if (side !== "left" && side !== "right") {
      throw new Error(
        ". must be left or right. For Exists types, use destructuring assignment."
      );
    }
    const ret = side === "left" ? lt.left : lt.right;
    if (require !== undefined && !typeEquals(require, ret)) {
      throw new Error(
        `. inconsistent with require: required: ${unparseType(
          require
        )} returned: ${unparseType(ret)}`
      );
    }
    return {
      type: ret,
      impl: async (ctx) => {
        const val = await impl(ctx);
        if (!(typeof val === "object" && "left" in val && "right" in val)) {
          throw new Error("runtime error: . operator on non-&& object");
        }
        return val[side];
      },
    };
  }
  if (ast.type === "for") {
    const { iter, proof, cond, step, body } = ast;

    if (
      iter.assertion !== undefined &&
      (iter.assertion.type !== "identifier" || iter.assertion.value !== "N")
    ) {
      throw new Error(`iter must be N`);
    }
    if (
      !typeEquals(rGetType(iter.right, typeContext, { type: "zero" }).type, {
        type: "zero",
      })
    ) {
      throw new Error(`iter must be initialized to 0`);
    }

    const iterVarName = iter.left;

    // the "n"
    const { type: boundValType, impl: boundValImpl } = rGetType(
      cond.right,
      typeContext,
      undefined
    );

    // if (boundValType.type !== "var") {
    //   throw new Error("unimplemented, for loop bound must be var or num");
    // }

    let propertyOfIter: TypeTree | undefined = proof.assertion
      ? typeAstToTypeTree(
          proof.assertion,
          {
            ...typeContext,
            [iterVarName.value]: {
              kind: "arithmetic",
              value: { type: "var", value: iterVarName.value },
            },
          },
          extra
        )
      : undefined;
    // require for base must be consistent with outer
    if (require !== undefined && boundValType.type === "var") {
      const outerBaseRequire = rewriteType(require, boundValType.value, {
        type: "var",
        value: iterVarName.value,
      });
      if (propertyOfIter === undefined) {
        propertyOfIter = outerBaseRequire;
      } else {
        if (!typeEquals(propertyOfIter, outerBaseRequire)) {
          throw new Error(
            `base require mismatch. declared here: ${unparseType(
              propertyOfIter
            )} but required of the loop: ${unparseType(outerBaseRequire)}`
          );
        }
      }
    }

    const proofVarName = proof.left;
    if (propertyOfIter === undefined) {
      throw new Error(
        `could not constrain the proof variable type. Add a type annotation on "${proofVarName.value}"`
      );
    }
    const baseRequire = rewriteType(propertyOfIter, iterVarName.value, {
      type: "zero",
    });
    const { type: baseType, impl: baseImpl } = rGetType(
      proof.right,
      typeContext,
      baseRequire
    );
    if (!typeEquals(baseType, baseRequire)) {
      throw new Error(
        `base type mismatch. Required type for "${
          proofVarName.value
        }" is ${unparseType(baseRequire)} but got ${unparseType(baseType)}`
      );
    }

    if (cond.type !== "<") {
      throw new Error(`condition type must be "<", got ${cond.type}`);
    }
    if (cond.left.type !== "identifier") {
      throw new Error(
        `condition left side must be an identifier, got ${cond.left.type}`
      );
    }
    if (cond.left.value !== iterVarName.value) {
      throw new Error(
        `condition left side identifier must be "${iterVarName.value}", got "${cond.left.value}"`
      );
    }

    if (step.type !== "++") {
      throw new Error(`step type must be "++", got ${step.type}`);
    }
    if (step.value.value !== iterVarName.value) {
      throw new Error(
        `step variable must be the first declared ("${iterVarName.value}"), got "${step.value.value}"`
      );
    }

    const propertyOfSuccIter = rewriteType(propertyOfIter, iterVarName.value, {
      type: "succ",
      value: { type: "var", value: iterVarName.value },
    });
    const iterType = { type: "var", value: iterVarName.value } as const;
    extra?.push({
      infoType: "var defined",
      varName: iterVarName.value,
      varType: unparseType(iterType),
      meta: body.meta,
    });
    extra?.push({
      infoType: "var defined",
      varName: proofVarName.value,
      varType: unparseType(propertyOfIter),
      meta: body.meta,
    });
    extra?.push({
      infoType: "var hover",
      varInfo: iterVarName.meta,
      type: unparseType(iterType),
    });
    extra?.push({
      infoType: "var hover",
      varInfo: proofVarName.meta,
      type: unparseType(propertyOfIter),
    });
    extra?.push({
      infoType: "var hover",
      varInfo: cond.left.meta,
      type: unparseType({ type: "var", value: iterVarName.value }),
    });
    extra?.push({
      infoType: "var hover",
      varInfo: step.value.meta,
      type: unparseType({ type: "var", value: iterVarName.value }),
    });
    const { type: stepType, impl: stepImpl } = rGetType(
      body,
      {
        ...typeContext,
        [iterVarName.value]: {
          kind: "arithmetic",
          value: iterType,
        },
        [proofVarName.value]: { kind: "proof", value: propertyOfIter },
      },
      propertyOfSuccIter,
      "continue"
    );
    if (!typeEquals(stepType, propertyOfSuccIter)) {
      throw new Error(`step type mismatch`);
    }

    return {
      type: rewriteType(propertyOfIter, iterVarName.value, boundValType),
      impl: async (ctx) => {
        const bound = await boundValImpl(ctx);
        if (typeof bound !== "bigint") {
          throw new Error("runtime error: bound must be bigint");
        }
        let prop = await baseImpl(ctx);
        for (let iter = 0n; iter < bound; iter++) {
          await new Promise((resolve) => setTimeout(resolve, 0));
          if (stuff.interpreterKillSwitch?.kill) {
            throw new Error("runtimer error: interpreter execution was killed");
          }
          prop = await stepImpl({
            ...ctx,
            [iterVarName.value]: iter,
            [proofVarName.value]: prop,
          });
        }
        return prop;
      },
    };
  }
  if (ast.type === "switch") {
    return getSwitchType(ast, "break");
  }
  if (ast.type === "+" || ast.type === "*") {
    const { type: leftType, impl: leftImpl } = rGetType(
      ast.left,
      typeContext,
      undefined
    );
    const { type: rightType, impl: rightImpl } = rGetType(
      ast.right,
      typeContext,
      undefined
    );
    if (makeTagged(leftType).kind !== "arithmetic") {
      throw new Error(
        `left of ${ast.type} must be arithmetic, got ${unparseType(leftType)}`
      );
    }
    if (makeTagged(rightType).kind !== "arithmetic") {
      throw new Error(
        `right of ${ast.type} must be arithmetic, got ${unparseType(leftType)}`
      );
    }
    return {
      type: {
        type: ast.type,
        left: leftType as ArithmeticTree,
        right: rightType as ArithmeticTree,
      },
      impl: async (ctx) => {
        const left = await leftImpl(ctx);
        const right = await rightImpl(ctx);
        if (typeof left !== "bigint" || typeof right !== "bigint") {
          throw new Error("arithmetic impl got non-integer");
        }
        return ast.type === "+" ? left + right : left * right;
      },
    };
  }
  if (ast.type === "efield" || ast.type === "const") {
    throw new Error(`unexpected "${ast.type}" in expression`);
  }
  const _: never = ast.type;
  throw new Error(`GetType: unknown type ${ast.type}`);
}

export function code2StringNoError(c: string): string {
  const { ret, extra } = code2Stuff(c);
  for (const info of extra) {
    if (info.infoType === "error") {
      throw new Error(
        `found error ${info.errorText} at ${info.meta.start}-${info.meta.end}`
      );
    }
  }
  return ret;
}

export function code2Stuff(
  c: string,
  compilerOptions: CompilerOptions | undefined = undefined,
  exerciseRequirements: ExerciseRequirements | undefined = undefined,
  interpreterKillSwitch: InterpreterKillSwitch | undefined = undefined
): {
  ret: string;
  implRet: string;
  extra: ExtraInfo[];
  exerciseResult?: ExerciseResult;
} {
  const extra: ExtraInfo[] = [];
  const ast = safeParseStatements(c);
  const exerciseIO: ExerciseIO | undefined = exerciseRequirements
    ? {
        ...exerciseRequirements,
        varDefined: false,
        varCorrectlyTyped: false,
        sorryUsed: false,
      }
    : undefined;
  const { type, impl: _impl } = getType(ast, axioms, undefined, {
    extra,
    compilerOptions,
    exerciseIO,
    interpreterKillSwitch,
  });
  let implRet: string;
  try {
    //implRet = bigintStringify(impl(axiomsImpl));
    implRet = "1337v2";
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof e.message === "string"
    ) {
      implRet = e.message;
    } else {
      implRet = "impl error";
    }
  }
  const ret = unparseType(type);
  return { ret, implRet, extra, exerciseResult: exerciseIO };
}
