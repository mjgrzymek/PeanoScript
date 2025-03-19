import nearley from "nearley";
import grammar from "./grammar";
import { ExpressionAst, Statements, TypeAst } from "./astTypes";
//import { unparseAst } from "../ui";
const typeGrammar = nearley.Grammar.fromCompiled(grammar);
typeGrammar.start = "logic";

const exprGrammar = nearley.Grammar.fromCompiled(grammar);
exprGrammar.start = "expr";

const statementsGrammar = nearley.Grammar.fromCompiled(grammar);
statementsGrammar.start = "code";

export class UnexpectedEOFError extends Error {
  constructor() {
    super("Unexpected end of code. Forgot a ; at the end?");
  }
}

export class AmbiguityError extends Error {
  constructor() {
    super("Grammar ambiguity (parser bug). Try to add more parentheses.");
  }
}

function safeParse(grammar: nearley.Grammar, input: string) {
  const parser = new nearley.Parser(grammar);
  parser.feed(input);
  const len = parser.results.length;
  if (len === 1) {
    return parser.results[0];
  } else if (len === 0) {
    throw new UnexpectedEOFError();
  } else {
    //console.log(JSON.stringify(parser.results.map(unparseAst)));
    throw new AmbiguityError();
  }
}

export function safeParseType(input: string): TypeAst {
  return safeParse(typeGrammar, input);
}

export function safeParseExpr(input: string): ExpressionAst {
  return safeParse(exprGrammar, input);
}

export function safeParseStatements(input: string): Statements {
  //console.log("enter parse");
  const ret = safeParse(statementsGrammar, input);
  //console.log("leave parse");
  ret.topLevel = true;
  return ret;
}
