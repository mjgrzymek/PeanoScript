/* eslint-disable */
// @ts-nocheck

// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var equals: any;
declare var notEquals: any;
declare var ws: any;
declare var identifier: any;
declare var num: any;
declare var lparen: any;
declare var rparen: any;
declare var assign: any;
declare var consoleLog: any;

import moo from "moo";
const lexer = moo.compile({
  ws: { match: /\s+|\/\/.*/, lineBreaks: true },
  consoleLog: /console\s*\.\s*log|print/,
  special: [":", "=>", ";", ",", ".", "++"],
  lparen: "(",
  rparen: ")",
  lcopm: "<",
  rcopm: ">",
  brace: ["{", "}"],
  equals: ["==", "==="],
  notEquals: ["!=", "!=="],
  unop: ["!"],
  binop: ["+", "*", "&&", "||"],
  assign: "=",
  num: /[0-9]+/,
  identifier: { match: /[a-zA-Z_][a-zA-Z0-9_]*/, type: moo.keywords({
    KW: ["as", "const", "return", "continue", "for", "switch", "break", "let", "type", "extends", "function"]
  })},
  lexError: {
    match: /./,
    error: true
  }
});
function tokenToBounds(token){
    if(token.text === undefined){
        throw new PeaScriptError("weird token", token);
    }
    return {start: token.offset, end: token.offset + token.text.length}
}
function dataToBounds(data) {
    let start = null;
    let end = null;
    for (let i = 0; i < data.length; i++) {
        if(data[i] === null){
            continue;
        }
        if (data[i].meta !== undefined && data[i].meta !== null) {
            if (start === null || data[i].meta.start < start) {
                start = data[i].meta.start;
            }
            if (end === null || data[i].meta.end > end) {
                end = data[i].meta.end;
            }
        }
    }
    if (start === null || end === null) {
        return null;
    }
    return { start, end };
}

class PeaScriptError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
        this.PeaScriptErrorTag = true;
    }
}

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "expr", "symbols": ["arit"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "logic", "symbols": ["impl"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "code", "symbols": ["statements"], "postprocess":  d => { 
        return ({...d[0], meta: dataToBounds(d)})}
        },
    {"name": "statements$ebnf$1", "symbols": []},
    {"name": "statements$ebnf$1$subexpression$1", "symbols": ["_", "statement"], "postprocess": d => ({...d[1], meta: dataToBounds(d)})},
    {"name": "statements$ebnf$1", "symbols": ["statements$ebnf$1", "statements$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "statements", "symbols": ["statements$ebnf$1", "_"], "postprocess":  d => {
            const ret = {type: "statements", value: d[0], meta: dataToBounds([...d[0], d[1]]) };
            return ret;
        } },
    {"name": "comparison", "symbols": ["identifier", "_", "Lcomp", "_", "arit", "_", {"literal":";"}], "postprocess": d => ({type: "<", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "increment", "symbols": ["identifier", "_", {"literal":"++"}], "postprocess": d => ({type: "++", value: d[0], meta: dataToBounds(d)})},
    {"name": "for$subexpression$1", "symbols": ["const", "_", "semicolon"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "for$subexpression$2", "symbols": ["const", "_", "semicolon"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "for$subexpression$3", "symbols": ["block"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "for", "symbols": ["For", "_", "lparen", "_", "for$subexpression$1", "_", "for$subexpression$2", "_", "comparison", "_", "increment", "_", "rparen", "_", "for$subexpression$3"], "postprocess": d => ({type: "for", iter: d[4], proof: d[6], cond: d[8], step: d[10], body: d[14], meta: dataToBounds(d) })},
    {"name": "case_guard", "symbols": ["lbrace", "_", "identifier", "_", {"literal":":"}, "_", "identifier", "_", "rbrace"], "postprocess": d => ({type: "case guard", left: d[2], right: d[6], meta: dataToBounds(d)})},
    {"name": "case", "symbols": ["Case", "_", "case_guard", "_", {"literal":":"}, "statements"], "postprocess": d => ({type: "case", left: d[2], right: d[5], meta: dataToBounds(d)})},
    {"name": "switch$ebnf$1", "symbols": []},
    {"name": "switch$ebnf$1", "symbols": ["switch$ebnf$1", "case"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "switch", "symbols": ["Switch", "_", "lparen", "_", "arit", "_", "rparen", "_", "lbrace", "_", "switch$ebnf$1", "rbrace"], "postprocess": d => ({type: "switch", value: d[4], cases: d[10], meta: dataToBounds(d)})},
    {"name": "const$ebnf$1", "symbols": ["type_assertion"], "postprocess": id},
    {"name": "const$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "const", "symbols": ["ConstLet", "_", "identifier", "const$ebnf$1", "_", "Assign", "_", "expr"], "postprocess": d => ({type: "const", left: d[2], right: d[7], assertion: d[3] ?? undefined, meta: dataToBounds(d) })},
    {"name": "return", "symbols": ["Return", "_", "expr"], "postprocess": d => ({type: "return", value: d[2], kind: d[0], meta: dataToBounds(d)})},
    {"name": "identifier_or_rename", "symbols": ["identifier"], "postprocess": d => ({from: d[0], to: null, meta: d[0].meta})},
    {"name": "identifier_or_rename", "symbols": ["identifier", "_", {"literal":":"}, "_", "identifier"], "postprocess": d => ({from: d[0], to: d[4], meta: dataToBounds(d)})},
    {"name": "multi_const", "symbols": ["ConstLet", "_", "lbrace", "_", "identifier_or_rename", "_", "comma", "_", "identifier_or_rename", "_", "rbrace", "_", "Assign", "_", "expr"], "postprocess": d => ({type: "multi const", left: [d[4], d[8]], right: d[14], meta: dataToBounds(d)})},
    {"name": "typedef", "symbols": ["Type", "_", "identifier", "_", "Assign", "_", "logic"], "postprocess": d => ({type: "typedef", left: d[2], right: d[6], meta: dataToBounds(d)})},
    {"name": "logStatement", "symbols": ["ConsoleLog", "_", "lparen", "_", "arglist", "_", "rparen"], "postprocess": d => ({type: "console.log", value: d[4], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["const"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["return"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["multi_const"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["typedef"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["GenericTypeDefinition"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "pre_statement", "symbols": ["logStatement"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "statement$subexpression$1$subexpression$1", "symbols": ["pre_statement"], "postprocess": id},
    {"name": "statement$subexpression$1$subexpression$1", "symbols": [], "postprocess": d => ({type: "empty statement", meta: null})},
    {"name": "statement$subexpression$1", "symbols": ["statement$subexpression$1$subexpression$1", "_", "semicolon"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "statement", "symbols": ["statement$subexpression$1"], "postprocess": id},
    {"name": "statement", "symbols": ["switch"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "statement", "symbols": ["eimpl_function"], "postprocess": id},
    {"name": "impl_arg", "symbols": ["identifier", "_", {"literal":":"}, "_", "logic"], "postprocess": d => ({leftName: d[0], left: d[4], meta: dataToBounds(d)})},
    {"name": "impl$ebnf$1", "symbols": []},
    {"name": "impl$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "impl_arg"]},
    {"name": "impl$ebnf$1", "symbols": ["impl$ebnf$1", "impl$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "impl", "symbols": ["lparen", "_", "impl_arg", "impl$ebnf$1", "_", "rparen", "_", "Arrow", "_", "impl"], "postprocess":  d => {
            const args = [d[2], ...d[3].map(item => item[3])];
            const revArgs = args.toReversed();
            const [lastArg, ...restArgs] = revArgs;
            const impl = d[9];
            let ans = {type: "t=>", leftName: lastArg.leftName, left: lastArg.left, right: impl, meta: dataToBounds(d)};
            for(const arg of restArgs){
                ans = {type: "t=>", leftName: arg.leftName, left: arg.left, right: ans, meta: dataToBounds([arg, ans])};
            }
            return ans;
        } },
    {"name": "impl", "symbols": ["or"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "or", "symbols": ["or", "_", {"literal":"||"}, "_", "and"], "postprocess": d => ({type: "||", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "or", "symbols": ["and"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "and", "symbols": ["and", "_", {"literal":"&&"}, "_", "eq"], "postprocess": d => ({type: "&&", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "and", "symbols": ["eq"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "eq", "symbols": ["type_plus", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "type_plus"], "postprocess": d => ({type: "==", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "eq", "symbols": ["type_plus", "_", (lexer.has("notEquals") ? {type: "notEquals"} : notEquals), "_", "type_plus"], "postprocess": d => ({type: "!=", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "eq", "symbols": ["type_plus"], "postprocess": id},
    {"name": "type_plus", "symbols": ["type_plus", "_", {"literal":"+"}, "_", "type_mult"], "postprocess": d => ({type: "+", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "type_plus", "symbols": ["type_mult"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "type_mult", "symbols": ["type_mult", "_", {"literal":"*"}, "_", "unoperable_logic"], "postprocess": d => ({type: "*", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "type_mult", "symbols": ["unoperable_logic"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "type_call", "symbols": ["identifier", "_", "lparen", "_", "logic", "_", "rparen"], "postprocess": d => ({type: "call", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "unoperable_logic", "symbols": ["not"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "not", "symbols": ["Exclaim", "not"], "postprocess": d => ({type: "t!", value: d[1], meta: dataToBounds(d)})},
    {"name": "not", "symbols": ["bottom_logic"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_logic", "symbols": ["num"], "postprocess": id},
    {"name": "bottom_logic", "symbols": ["identifier"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_logic", "symbols": ["lparen", "_", "logic", "_", "rparen"], "postprocess": d => ({...d[2], meta: dataToBounds(d)})},
    {"name": "bottom_logic$subexpression$1", "symbols": ["semicolon"]},
    {"name": "bottom_logic$subexpression$1", "symbols": ["comma"]},
    {"name": "bottom_logic", "symbols": ["lbrace", "_", "identifier", "type_assertion", "_", "bottom_logic$subexpression$1", "_", "identifier", "type_assertion", "_", "rbrace"], "postprocess": d => ({type: "tstruct", value: [{type: "tfield", left: d[2], right: d[3]}, {type: "tfield", left: d[7], right: d[8] }], meta: dataToBounds(d)})},
    {"name": "bottom_logic", "symbols": ["logic_generic_call"], "postprocess": d => d[0]},
    {"name": "bottom_logic", "symbols": ["type_call"], "postprocess": id},
    {"name": "logic_or_arit", "symbols": ["logic"], "postprocess": d => d[0]},
    {"name": "logic_generic_call$ebnf$1", "symbols": []},
    {"name": "logic_generic_call$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "logic_or_arit"]},
    {"name": "logic_generic_call$ebnf$1", "symbols": ["logic_generic_call$ebnf$1", "logic_generic_call$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "logic_generic_call", "symbols": ["identifier", "_", "Lcomp", "_", "logic_or_arit", "logic_generic_call$ebnf$1", "_", "Rcomp"], "postprocess": d => ({type: "type generic call", left: d[0], right: [d[4], ...d[5].map(g => g[3])], meta: dataToBounds(d)})},
    {"name": "arit", "symbols": ["as"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "as", "symbols": ["as", "_", "As", "_", "logic"], "postprocess": d => ({type: "as", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "as", "symbols": ["eimpl"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "type_assertion", "symbols": ["_", {"literal":":"}, "_", "logic"], "postprocess": d => ({...d[3], meta: dataToBounds(d)})},
    {"name": "block", "symbols": ["lbrace", "statements", "rbrace"], "postprocess": d => ({...d[1], meta: dataToBounds(d)})},
    {"name": "eimpl_param$ebnf$1", "symbols": ["type_assertion"], "postprocess": id},
    {"name": "eimpl_param$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "eimpl_param", "symbols": ["identifier", "eimpl_param$ebnf$1"], "postprocess": d => ({leftName: d[0], left: d[1], meta: dataToBounds(d)})},
    {"name": "eimpl_tail$subexpression$1", "symbols": ["eimpl"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "eimpl_tail$subexpression$1", "symbols": ["block"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "eimpl_tail", "symbols": ["_", "Arrow", "_", "eimpl_tail$subexpression$1"], "postprocess": d => d[3]},
    {"name": "eimpl_multiarg_head$ebnf$1", "symbols": []},
    {"name": "eimpl_multiarg_head$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "eimpl_param"]},
    {"name": "eimpl_multiarg_head$ebnf$1", "symbols": ["eimpl_multiarg_head$ebnf$1", "eimpl_multiarg_head$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "eimpl_multiarg_head$ebnf$2", "symbols": ["type_assertion"], "postprocess": id},
    {"name": "eimpl_multiarg_head$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "eimpl_multiarg_head", "symbols": ["lparen", "_", "eimpl_param", "eimpl_multiarg_head$ebnf$1", "_", "rparen", "eimpl_multiarg_head$ebnf$2"], "postprocess":  d => ogRight => { // trick, returning function here
            const args = [d[2], ...d[3].map(item => item[3])];
            const lastarg = d[3].slice(-1)[0];
            const ogAssertion = d[6];
            function makify(arg, right){
                return {type: "e=>", leftName: arg.leftName, left: arg.left ?? undefined, assertion: undefined, right, meta: dataToBounds([arg, right])}
            }
            const revArgs = args.toReversed();
            const [lastArg, ...restArgs] = revArgs;
            let ans = makify(lastArg, ogRight);
            ans.assertion = ogAssertion ?? undefined;
            for(const arg of restArgs){
                ans = makify(arg, ans);
            }
            ans.meta = dataToBounds([...d, ogRight]);
            return ans;
        } },
    {"name": "eimpl_multiarg", "symbols": ["eimpl_multiarg_head", "eimpl_tail"], "postprocess":  d => {
            const ogRight = d[1];
            return d[0](ogRight);
        } },
    {"name": "eimpl_function", "symbols": ["Function", "_", "identifier", "_", "eimpl_multiarg_head", "_", "block"], "postprocess": d => ({type: "const", left: d[2], right: d[4](d[6]), assertion: undefined, meta: dataToBounds(d) })},
    {"name": "eimpl", "symbols": ["identifier", "eimpl_tail"], "postprocess": d => ({type: "e=>", leftName: d[0], left: undefined, assertion: undefined, right: d[1], meta: dataToBounds(d)})},
    {"name": "eimpl", "symbols": ["eimpl_multiarg"], "postprocess": id},
    {"name": "eimpl", "symbols": ["eand"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "eand", "symbols": ["eand", "_", {"literal":"&&"}, "_", "sum"], "postprocess": d => ({type: "e&&", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "eand", "symbols": ["sum"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "sum", "symbols": ["sum", "_", {"literal":"+"}, "_", "mul"], "postprocess": d =>  ({type: "+", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "sum", "symbols": ["mul"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "mul", "symbols": ["mul", "_", {"literal":"*"}, "_", "arifun"], "postprocess": d =>  ({type: "*", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "mul", "symbols": ["arifun"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "arifun", "symbols": ["arifun", "_", "lparen", "_", "arglist", "_", "rparen"], "postprocess":  d => {
            // d[0]: the function expression
            // d[4]: an array of one or more arguments, as parsed by "arglist"
            const args = d[4];
            // Build nested calls: f(1,2,3) becomes ((f(1))(2))(3)
            let result = d[0];
            for(const arg of args){
                result = { type: "call", left: result, right: arg, meta: dataToBounds([result, arg]) };
            }
            return result;
        } },
    {"name": "arifun", "symbols": ["arifun", "_", "lparen", "_", "rparen"], "postprocess": d => ({type: "call", left: d[0], right: "empty call", meta: dataToBounds(d)})},
    {"name": "arifun", "symbols": ["arifun", "_", {"literal":"."}, "_", "identifier"], "postprocess": d => ({type: ".", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "arifun", "symbols": ["arigenericfun"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "arglist$ebnf$1", "symbols": []},
    {"name": "arglist$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "arit"]},
    {"name": "arglist$ebnf$1", "symbols": ["arglist$ebnf$1", "arglist$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "arglist", "symbols": ["arit", "arglist$ebnf$1"], "postprocess": d => [d[0], ...d[1].map(item => item[3])]},
    {"name": "arigenericfun", "symbols": ["identifier", "_", "Lcomp", "_", "logic", "_", "Rcomp"], "postprocess": d => ({type: "generic call", left: d[0], right: d[4], meta: dataToBounds(d)})},
    {"name": "arigenericfun", "symbols": ["bottom_arit"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "estruct", "symbols": ["lbrace", "_", "identifier", "_", {"literal":":"}, "_", "arit", "_", "comma", "_", "identifier", "_", {"literal":":"}, "_", "arit", "_", "rbrace"], "postprocess": 
        d =>  {
            const leftFieldName = d[2];
            const rightFieldName = d[10];
            const leftFieldValue = d[6];
            const rightFieldValue = d[14];
            if(leftFieldName.value === "left" && rightFieldName.value === "right"){
                return ({type: "e&&", left: leftFieldValue, right: rightFieldValue, meta: dataToBounds(d)})
            }
            if(leftFieldName.value === "right" && rightFieldName.value === "left"){
                return ({type: "e&&", left: rightFieldValue, right: leftFieldValue, meta: dataToBounds(d)})
            }
            return ({type: "estruct",
                    value: [{type: "efield", left: leftFieldName, right: leftFieldValue},
                    {type: "efield", left: rightFieldName, right: rightFieldValue }],
                    meta: dataToBounds(d)})
        }
        },
    {"name": "makeOr", "symbols": ["lbrace", "_", "identifier", "_", {"literal":":"}, "_", "arit", "_", "rbrace"], "postprocess":  d => {
            const property = d[2].value;
            const value = d[6];
            if(property === "left"){
                return {type: "call", left: {...d[2], value: "makeLeft"}, right: value, meta: dataToBounds(d)}
            }else if(property === "right"){
                return {type: "call", left: {...d[2], value: "makeRight"}, right: value, meta: dataToBounds(d)}
            }else{
                throw new PeaScriptError("Invalid property for makeOr", d[2]);
            }
        } },
    {"name": "bottom_arit", "symbols": ["num"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["identifier"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["lparen", "_", "arit", "_", "rparen"], "postprocess": d => ({...d[2], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["estruct"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["for"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["switch"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "bottom_arit", "symbols": ["makeOr"], "postprocess": d => ({...d[0], meta: dataToBounds(d)})},
    {"name": "GenericTypeDefinition", "symbols": ["Type", "_", "identifier", "_", {"literal":"<"}, "_", "GenericTypeParameters", "_", {"literal":">"}, "_", "Assign", "_", "logic"], "postprocess": d => ({type: "generic typedef", name: d[2], parameters: d[6], value: d[12], meta: dataToBounds(d)})},
    {"name": "GenericTypeParameters$ebnf$1", "symbols": []},
    {"name": "GenericTypeParameters$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "GenericTypeParameter"]},
    {"name": "GenericTypeParameters$ebnf$1", "symbols": ["GenericTypeParameters$ebnf$1", "GenericTypeParameters$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "GenericTypeParameters", "symbols": ["GenericTypeParameter", "GenericTypeParameters$ebnf$1"], "postprocess": d => [d[0], ...d[1].map(g => g[3])]},
    {"name": "GenericTypeParameter", "symbols": ["identifier", "_", {"literal":"extends"}, "_", "identifier"], "postprocess": d => ({name: d[0], constraint: d[4], meta: dataToBounds(d)})},
    {"name": "white", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": d => ({type: "whitespace", ...d[0], meta: tokenToBounds(d[0])})},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "white"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => ({type: "rawwhite", meta: dataToBounds(d[0])})},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess":  d => { 
                const tok = ({...d[0], meta: tokenToBounds(d[0])});
                if(Object.getOwnPropertyNames(Object.getPrototypeOf({})).includes(tok.value)){
                    throw new PeaScriptError(`Identifier "${tok.value}" is illegal because of reasons. Use a different name.`, tok);
                }
                return ({...d[0], meta: tokenToBounds(d[0])})
        }},
    {"name": "num", "symbols": [(lexer.has("num") ? {type: "num"} : num)], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "lparen", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen)], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "rparen", "symbols": [(lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "lbrace", "symbols": [{"literal":"{"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "rbrace", "symbols": [{"literal":"}"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "semicolon", "symbols": [{"literal":";"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "comma", "symbols": [{"literal":","}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "For", "symbols": [{"literal":"for"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Lcomp", "symbols": [{"literal":"<"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Rcomp", "symbols": [{"literal":">"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Switch$subexpression$1", "symbols": [{"literal":"switch"}], "postprocess": id},
    {"name": "Switch$subexpression$1", "symbols": [{"literal":"match"}], "postprocess": id},
    {"name": "Switch", "symbols": ["Switch$subexpression$1"], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Case", "symbols": [{"literal":"case"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Return$subexpression$1", "symbols": [{"literal":"return"}], "postprocess": id},
    {"name": "Return$subexpression$1", "symbols": [{"literal":"continue"}], "postprocess": id},
    {"name": "Return$subexpression$1", "symbols": [{"literal":"break"}], "postprocess": id},
    {"name": "Return", "symbols": ["Return$subexpression$1"], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "As", "symbols": [{"literal":"as"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Type", "symbols": [{"literal":"type"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "ConstLet$subexpression$1", "symbols": [{"literal":"const"}], "postprocess": id},
    {"name": "ConstLet$subexpression$1", "symbols": [{"literal":"let"}], "postprocess": id},
    {"name": "ConstLet", "symbols": ["ConstLet$subexpression$1"], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Assign", "symbols": [(lexer.has("assign") ? {type: "assign"} : assign)], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Exclaim", "symbols": [{"literal":"!"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Arrow", "symbols": [{"literal":"=>"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "ConsoleLog", "symbols": [(lexer.has("consoleLog") ? {type: "consoleLog"} : consoleLog)], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})},
    {"name": "Function", "symbols": [{"literal":"function"}], "postprocess": d => ({...d[0], meta: tokenToBounds(d[0])})}
  ],
  ParserStart: "expr",
};

export default grammar;
