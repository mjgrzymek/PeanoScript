@preprocessor typescript
@{%
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
%}

@lexer lexer

expr -> arit {% d => ({...d[0], meta: dataToBounds(d)}) %}

# expcall -> expcall _ "(" _ expr _ ")" {% d => ({type: "call", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
#     | bottom_expr {% d => ({...d[0], meta: dataToBounds(d)}) %}

# bottom_expr -> "(" _ expr _ ")" {% d => ({...d[2], meta: dataToBounds(d)}) %} | arit {% d => ({...d[0], meta: dataToBounds(d)}) %}

logic -> impl {% d => ({...d[0], meta: dataToBounds(d)}) %}

code ->  statements {% d => { 
    return ({...d[0], meta: dataToBounds(d)})}
%}

statements -> (_ statement {% d => ({...d[1], meta: dataToBounds(d)}) %}):*  _ {% d => {
    const ret = {type: "statements", value: d[0], meta: dataToBounds([...d[0], d[1]]) };
    return ret;
} %}


comparison -> identifier _ Lcomp _ arit _ ";" {% d => ({type: "<", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
increment -> identifier _ "++" {% d => ({type: "++", value: d[0], meta: dataToBounds(d)}) %}

for -> For _ lparen _ (const _ semicolon {% d => ({...d[0], meta: dataToBounds(d)}) %})
    _ (const _ semicolon {% d => ({...d[0], meta: dataToBounds(d)}) %})
    _ comparison _ increment _ rparen _
    (block {% d => ({...d[0], meta: dataToBounds(d)}) %}) #| (pre_statement {%id%} | switch {%id%}) {% d => ({type: "statements", value: [d[0]], meta: dataToBounds(d)})%} )
    {% d => ({type: "for", iter: d[4], proof: d[6], cond: d[8], step: d[10], body: d[14], meta: dataToBounds(d) }) %}

case_guard -> lbrace _ identifier _ ":" _ identifier _ rbrace
    {% d => ({type: "case guard", left: d[2], right: d[6], meta: dataToBounds(d)}) %}

case -> Case _ case_guard _ ":"  statements  {% d => ({type: "case", left: d[2], right: d[5], meta: dataToBounds(d)}) %}

switch -> Switch _ lparen _ arit _ rparen _ lbrace _ case:* rbrace
    {% d => ({type: "switch", value: d[4], cases: d[10], meta: dataToBounds(d)}) %}

const -> ConstLet _ identifier type_assertion:? _ Assign _ expr
    {% d => ({type: "const", left: d[2], right: d[7], assertion: d[3] ?? undefined, meta: dataToBounds(d) }) %}

return -> Return _ expr 
    {% d => ({type: "return", value: d[2], kind: d[0], meta: dataToBounds(d)}) %}

identifier_or_rename -> identifier {% d => ({from: d[0], to: null, meta: d[0].meta}) %}
    | identifier _ ":" _ identifier {% d => ({from: d[0], to: d[4], meta: dataToBounds(d)}) %}

#todo maybe add assertion
multi_const -> ConstLet _ lbrace _ identifier_or_rename _ comma _ identifier_or_rename _ rbrace _ Assign _ expr 
    {% d => ({type: "multi const", left: [d[4], d[8]], right: d[14], meta: dataToBounds(d)}) %}

typedef -> Type _ identifier _ Assign _ logic
    {% d => ({type: "typedef", left: d[2], right: d[6], meta: dataToBounds(d)}) %}

logStatement -> ConsoleLog _ lparen _ arglist _ rparen
    {% d => ({type: "console.log", value: d[4], meta: dataToBounds(d)}) %}

pre_statement -> const {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | return {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | multi_const {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | typedef {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | GenericTypeDefinition {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | logStatement {% d => ({...d[0], meta: dataToBounds(d)}) %}



statement -> ( (pre_statement {%id%} | null  {%  d => ({type: "empty statement", meta: null}) %})
        _ semicolon {% d => ({...d[0], meta: dataToBounds(d)}) %} ) {%id%} 
        | switch {% d => ({...d[0], meta: dataToBounds(d)}) %}
        | eimpl_function {%id%} 

impl_arg -> identifier _ ":" _ logic {%d => ({leftName: d[0], left: d[4], meta: dataToBounds(d)}) %}
impl -> lparen _ impl_arg (_ comma _ impl_arg):* _ rparen _ Arrow _ impl
    {% d => {
    const args = [d[2], ...d[3].map(item => item[3])];
    const revArgs = args.toReversed();
    const [lastArg, ...restArgs] = revArgs;
    const impl = d[9];
    let ans = {type: "t=>", leftName: lastArg.leftName, left: lastArg.left, right: impl, meta: dataToBounds(d)};
    for(const arg of restArgs){
        ans = {type: "t=>", leftName: arg.leftName, left: arg.left, right: ans, meta: dataToBounds([arg, ans])};
    }
    return ans;
} %}
    | or {% d => ({...d[0], meta: dataToBounds(d)}) %}

or -> or _ "||" _ and
    {% d => ({type: "||", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | and
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

and -> and _ "&&" _ eq
    {% d => ({type: "&&", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | eq
    {% d => ({...d[0], meta: dataToBounds(d)}) %}


eq -> type_plus _ %equals _ type_plus # SUS
    {% d => ({type: "==", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | type_plus _ %notEquals _ type_plus # SUS
    {% d => ({type: "!=", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | type_plus {% id %}

type_plus -> type_plus _ "+" _ type_mult
    {% d => ({type: "+", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | type_mult
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

type_mult -> type_mult _ "*" _ unoperable_logic
    {% d => ({type: "*", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | unoperable_logic
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

type_call -> identifier _ lparen _ logic _ rparen
    {% d => ({type: "call", left: d[0], right: d[4], meta: dataToBounds(d)}) %}

unoperable_logic -> not {% d => ({...d[0], meta: dataToBounds(d)}) %}

not -> Exclaim not  {% d => ({type: "t!", value: d[1], meta: dataToBounds(d)}) %} 
    | bottom_logic {% d => ({...d[0], meta: dataToBounds(d)}) %}

bottom_logic -> num {%id%}
    | identifier {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | lparen _ logic _ rparen {% d => ({...d[2], meta: dataToBounds(d)}) %}
    | lbrace _ identifier type_assertion _ (semicolon|comma) _ identifier type_assertion _ rbrace
    {% d => ({type: "tstruct", value: [{type: "tfield", left: d[2], right: d[3]}, {type: "tfield", left: d[7], right: d[8] }], meta: dataToBounds(d)}) %}
    | logic_generic_call {% d => d[0] %}
    | type_call {% id %}
    
# TODO SUS
logic_or_arit -> logic {% d => d[0] %} 
logic_generic_call -> identifier _ Lcomp _ logic_or_arit ( _ comma _ logic_or_arit  ):* _ Rcomp
    {% d => ({type: "type generic call", left: d[0], right: [d[4], ...d[5].map(g => g[3])], meta: dataToBounds(d)}) %}

arit -> as {% d => ({...d[0], meta: dataToBounds(d)}) %}

as -> as _ As _ logic 
    {% d => ({type: "as", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | eimpl {% d => ({...d[0], meta: dataToBounds(d)}) %}

type_assertion -> _ ":" _ logic {% d => ({...d[3], meta: dataToBounds(d)}) %}

block -> lbrace  statements rbrace {% d => ({...d[1], meta: dataToBounds(d)}) %}

eimpl_param -> identifier type_assertion:? {% d => ({leftName: d[0], left: d[1], meta: dataToBounds(d)}) %}
eimpl_tail -> _ Arrow _
        (eimpl {% d => ({...d[0], meta: dataToBounds(d)}) %}
            | block {% d => ({...d[0], meta: dataToBounds(d)}) %}
        ) {% d => d[3] %}

eimpl_multiarg_head -> lparen _ eimpl_param (_ comma _ eimpl_param):* _ rparen  type_assertion:?
{% d => ogRight => { // trick, returning function here
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
} %}

eimpl_multiarg -> eimpl_multiarg_head eimpl_tail
{% d => {
    const ogRight = d[1];
    return d[0](ogRight);
} %}

eimpl_function -> Function _ identifier _ eimpl_multiarg_head _ block
    {% d => ({type: "const", left: d[2], right: d[4](d[6]), assertion: undefined, meta: dataToBounds(d) }) %}


eimpl ->  
        identifier
        eimpl_tail
        {% d => ({type: "e=>", leftName: d[0], left: undefined, assertion: undefined, right: d[1], meta: dataToBounds(d)}) %}
    |
     eimpl_multiarg {% id %}
    | eand
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

eand -> eand _ "&&" _ sum 
    {% d => ({type: "e&&", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | sum
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

sum ->
    sum _ "+" _ mul
    {% d =>  ({type: "+", left: d[0], right: d[4], meta: dataToBounds(d)})  %}
    | mul
    {% d => ({...d[0], meta: dataToBounds(d)}) %} 


mul -> 
    mul _ "*" _ arifun
    {% d =>  ({type: "*", left: d[0], right: d[4], meta: dataToBounds(d)})  %}
    | arifun
    {% d => ({...d[0], meta: dataToBounds(d)}) %}



arifun -> arifun _ lparen _ arglist _ rparen
    {% d => {
          // d[0]: the function expression
          // d[4]: an array of one or more arguments, as parsed by "arglist"
          const args = d[4];
          // Build nested calls: f(1,2,3) becomes ((f(1))(2))(3)
          let result = d[0];
          for(const arg of args){
              result = { type: "call", left: result, right: arg, meta: dataToBounds([result, arg]) };
          }
          return result;
      } %}
  | arifun _ lparen _ rparen
    {% d => ({type: "call", left: d[0], right: "empty call", meta: dataToBounds(d)}) %}
  | arifun _ "." _ identifier
    {% d => ({type: ".", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
  | arigenericfun
    {% d => ({...d[0], meta: dataToBounds(d)}) %}


arglist -> arit (_ comma _ arit):*
    {% d => [d[0], ...d[1].map(item => item[3])] %}


# arifun -> arifun _ lparen _ arit _ rparen
#     {% d => ({type: "call", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
#     | arigenericfun
#     {% d => ({...d[0], meta: dataToBounds(d)}) %}

arigenericfun -> identifier _ Lcomp _ logic _ Rcomp
    {% d => ({type: "generic call", left: d[0], right: d[4], meta: dataToBounds(d)}) %}
    | bottom_arit
    {% d => ({...d[0], meta: dataToBounds(d)}) %}

estruct -> lbrace _ identifier _ ":" _ arit _ comma _ identifier _ ":" _ arit _ rbrace 
{%
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
%}

makeOr -> lbrace _ identifier _ ":" _ arit _ rbrace
    {% d => {
        const property = d[2].value;
        const value = d[6];
        if(property === "left"){
            return {type: "call", left: {...d[2], value: "makeLeft"}, right: value, meta: dataToBounds(d)}
        }else if(property === "right"){
            return {type: "call", left: {...d[2], value: "makeRight"}, right: value, meta: dataToBounds(d)}
        }else{
            throw new PeaScriptError("Invalid property for makeOr", d[2]);
        }
    } %}

bottom_arit ->  num {% d => ({...d[0], meta: dataToBounds(d)}) %} | identifier {% d => ({...d[0], meta: dataToBounds(d)}) %} | lparen _ arit _ rparen {% d => ({...d[2], meta: dataToBounds(d)}) %} 
    | estruct {% d => ({...d[0], meta: dataToBounds(d)}) %}
    | for {% d => ({...d[0], meta: dataToBounds(d)}) %} | switch {% d => ({...d[0], meta: dataToBounds(d)}) %} | makeOr {% d => ({...d[0], meta: dataToBounds(d)}) %}

GenericTypeDefinition ->
    Type _ identifier _ "<" _ GenericTypeParameters _ ">" _ Assign _ logic
    {% d => ({type: "generic typedef", name: d[2], parameters: d[6], value: d[12], meta: dataToBounds(d)}) %}

GenericTypeParameters
  -> GenericTypeParameter (_ comma _ GenericTypeParameter):*
    {% d => [d[0], ...d[1].map(g => g[3])] %}

GenericTypeParameter
  -> identifier _ "extends" _ identifier
    {% d => ({name: d[0], constraint: d[4], meta: dataToBounds(d)}) %}

white -> %ws
    {% d => ({type: "whitespace", ...d[0], meta: tokenToBounds(d[0])}) %}

# _ -> %ws:*
#     {% d2 => dataToBounds(d2.map(d => ({...d[0], type: "whitespace", meta: d[0] ? tokenToBounds(d[0]) : null}))) %}

_ -> white:*
    {% d => ({type: "rawwhite", meta: dataToBounds(d[0])}) %}

identifier -> %identifier
    {% d => { 
        const tok = ({...d[0], meta: tokenToBounds(d[0])});
        if(Object.getOwnPropertyNames(Object.getPrototypeOf({})).includes(tok.value)){
            throw new PeaScriptError(`Identifier "${tok.value}" is illegal because of reasons. Use a different name.`, tok);
        }
        return ({...d[0], meta: tokenToBounds(d[0])})
}%}

num -> %num
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

# Define nonterminals for tokens with meta processing
lparen -> %lparen
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
rparen -> %rparen
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
lbrace -> "{"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
rbrace -> "}"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
semicolon -> ";"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
comma -> ","
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
For -> "for"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Lcomp -> "<"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}
Rcomp -> ">"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Switch -> ("switch" {%id%} | "match" {%id%} )
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %} 

Case -> "case"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Return -> ("return" {%id%} | "continue" {%id%} | "break" {%id%}) 
        {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

As -> "as"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Type -> "type"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

ConstLet -> ("const" {%id%} | "let" {%id%})
        {% d => ({...d[0], meta: tokenToBounds(d[0])}) %} 

Assign -> %assign
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Exclaim -> "!"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Arrow -> "=>"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

ConsoleLog -> %consoleLog
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}

Function -> "function"
    {% d => ({...d[0], meta: tokenToBounds(d[0])}) %}