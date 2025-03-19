import Link from "next/link";
import { CodeMirrorComponent } from "../src/codemirrorStuff/CodeMirrorComponent";

export default function Reference() {
  return (
    <div className="prose mx-auto  prose-a:text-blue-700 prose-a:visited:text-purple-900 ">
      <h1>PeanoScript reference</h1>
      <p>
        This is a reference page/cheat sheet for PeanoScript, the
        TypeScript-like theorem prover. For an in-depth explanation, see the{" "}
        <Link href="/tutorial">tutorial</Link>.{" "}
      </p>
      <h2 id="axioms">Axioms</h2>
      <p>The following functions are built in (with implementations):</p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const eqRefl: (x: N) => x == x = sorry;

const succInj
  : (x: N, y: N, eqSuccXY: succ(x) == succ(y)) => x == y
  = sorry;

const succNotZero: (x: N) => succ(x) != 0 = sorry;

const addZero: (x: N) => x + 0 == x = sorry;

const addSucc: (x: N, y: N) => x + succ(y) == succ(x + y)
  = sorry;

const mulZero: (x: N) => x * 0 == 0 = sorry;

const mulSucc: (x: N, y: N) => x * succ(y) == x * y + x
  = sorry;`}
      />
      <h2 id="assignment">Assignment</h2>
      <p>
        Permanently assigns a value to a name. Optionally uses a type
        annotation.
      </p>
      <CodeMirrorComponent readOnly initialDoc="const example: 7 = 7;" />
      <h2 id="arithmetic">Arithmetic</h2>
      <p>
        Arithmetic expressions are built from <code>0</code>, natural number
        variables introduced as function arguments, and the operations
        <code>succ(a)</code>, <code>a * b</code>, <code>a + b</code>. Arabic
        numerals can be used as syntax sugar, for example <code>2</code> is the
        same as <code>succ(succ(0))</code>.
      </p>
      <p>
        The type of an arithmetic expression looks the same as the expression.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc="const example: succ(2 + 2) = succ(2 + 2);"
      />
      <h2 id="equality">Equality</h2>
      <p>
        Given arithmetic expressions <code>A</code> and <code>B</code>,{" "}
        <code>A == B</code> is a type.
      </p>
      <p>
        Given arithmetic expressions <code>A</code>, <code>B</code>,{" "}
        <code>C</code>, terms <code>eqAB : A == B</code> and{" "}
        <code>eqBC : B == C</code>, and <code>f</code> a function that returns
        arithmetic expressions:
      </p>
      <ul>
        <li>
          <code>eqAB.symm()</code> is of type <code>B == A</code>.
        </li>
        <li>
          <code>eqAB.trans(eqBC)</code> is of type <code>A == C</code>.
        </li>
        <li>
          <code>eqAB.map(f)</code> is of type <code>f(A) == f(B)</code>.
        </li>
      </ul>
      <h2 id="functions">Functions</h2>
      <p>
        Functions follow the{" "}
        <a
          href="https://www.typescriptlang.org/docs/handbook/2/functions.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          TypeScript syntax
        </a>
        , including function types, arrow functions, and <code>function</code>{" "}
        statements, but not including <code>function</code> expressions.
      </p>
      <p>
        Functions are automatically curried, so{" "}
        <code>{`(a: T, b: T) => e`}</code> desugars to{" "}
        <code>{`(a: T) => (b: T) => e`}</code> and <code>f(a, b)</code> desugars
        to <code>f(a)(b)</code>.
      </p>
      <p>
        Function parameters can have a proposition type or the type{" "}
        <code>N</code>. The latter case introduces a new natural number
        variable, the return type of the function can use this variable.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const f1: (x: 0 == 0) => 0 == 0 = x => x;
const call = f1(eqRefl(0));

const f2 = (x: 0 == 0): 0 == 0 => x;
const f3 = (x: 0 == 0) => x;
const f4 = (x: 0 == 0) => {return x;};
function f5(x: 0 == 0): 0 == 0 {
    return x;
}

function f5(a: N): a == a {
    return eqRefl(a);
}

function f6(a: N, b: N, p: 0 == 1): a == b {
    return sorry;
}
const multiCall = f6(7, 10, sorry);`}
      />
      <h2 id="for-loop">For loop</h2>
      <p>
        The for loop expression is how PeanoScript does induction. It has the
        following syntax*:
      </p>
      <div className="font-mono whitespace-pre-wrap">{`for(let i=0; let acc: accType = base; i < bound; i++){
  [list of statements];
  continue updatedAcc;
}`}</div>
      <p>Where:</p>
      <ol>
        <li>
          <code>i</code> and <code>acc</code> are identifiers.
        </li>
        <li>
          <code>accType</code> is a type that might depend on <code>i</code>.
        </li>
        <li>
          <code>base</code>, <code>bound</code>, and <code>updatedAcc</code> are
          expressions.
        </li>
      </ol>
      <p>
        We will use the notation <code>{`expr[var:=val]`}</code> for the
        expression <code>expr</code> but with all instances of the name{" "}
        <code>var</code> replaced with <code>val</code>. A for loop is
        well-typed if:
      </p>
      <ol>
        <li>
          <code>base</code> is of type <code>accType[i:=0].</code>
        </li>
        <li>
          <code>bound</code> is an arithmetic expression.
        </li>
        <li>
          Given the context of the for loop with the added variables{" "}
          <code>i</code> (natural number) and <code>acc: accType</code>, the
          type of <code>updatedAcc</code>
          is <code>accType[i:=succ(i)]</code>.
        </li>
      </ol>
      <p>
        In this case, the type of the <code>for</code> expression is{" "}
        <code>accType[i:=bound]</code>.
      </p>
      <p>
        If there is no type annotation on <code>acc</code>, but the{" "}
        <code>for</code> expression has a required type <code>retType</code> and{" "}
        <code>bound</code> is a variable, <code>accType</code> will be guessed
        as <code>retType[bound:=i]</code>
      </p>
      <p>
        (*): The <code>continue</code> statement can also be inside a{" "}
        <code>match</code> statement.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const foo = for(let i=0; let acc: i == i = eqRefl(0); i<7; i++){
  continue acc.map(succ);
};`}
      />
      <h2 id="and-types">And types (&&)</h2>
      <p>
        Given types <code>A</code> and <code>B</code>, <code>A && B</code> is a
        type. Given terms <code>a : A</code> and <code>b : B</code>,{" "}
        <code>a && b</code> has type <code>A && B</code>. Given a term{" "}
        <code>ab: A && B</code>, <code>ab.left</code> has type <code>A</code>{" "}
        and <code>ab.right</code> has type <code>B</code>.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const example: 0 == 0 && 1 == 1 = eqRefl(0) && eqRefl(1);
const left = example.left;`}
      />
      <h2 id="exists-types">Exists types</h2>
      <p>
        An exists type is written <code>{`{x: N; prop: T}`}</code> where{" "}
        <code>x</code> and <code>prop</code> are identifiers, and <code>T</code>{" "}
        is a type that may depend on <code>x</code>.
      </p>
      <p>
        A value of this type can be created as{" "}
        <code>{`{x: NumExpr, prop: PropExpr}`}</code> where <code>NumExpr</code>{" "}
        is an arithmetic expression and <code>PropExpr</code> is of type{" "}
        <code>T[x:=NumExpr]</code>.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const example: {x: N; squaresToSelf: x*x == x} 
  = {x: 1, squaresToSelf: ring()};`}
      />
      <p>
        Hack note: while the property names in an Exists type are meaningful for
        interpreting object expressions and destructuring assignment, the
        compiler will accept a conversion between Exists types as long as
        they're logically equivalent. That is, the second property's name
        doesn't matter and the first property can be renamed. Without this
        feature, it would be difficult to work with generic Exists types, as the
        property names sometimes need to be renamed in a nested generic to not
        shadow generic parameters.
      </p>
      <h2 id="destructuring-assignment">Destructuring assignment</h2>
      <p>
        To use a value of an exists type, we use destructuring assignment. We
        can optionally rename one or both of the properties using{" "}
        <code>from: to</code> syntax.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const example: {x: N; squaresToSelf: x*x == x} 
  = {x: 1, squaresToSelf: ring()};
const {x, squaresToSelf} = example;
const {x: y, squaresToSelf: yIsCool} = example;`}
      />
      <h2 id="or-types">Or types (||)</h2>
      <p>
        Given types <code>A</code> and <code>B</code>, <code>A || B</code> is a
        type. Given <code>a: A</code> and <code>b: B</code> we can create a
        value of type <code>A || B</code> as
        <code>{`{left: a}`}</code> or <code>{`{right: b}`}</code>.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const example: 0 == 0 || 0 == 1 = {left: eqRefl(0)};`}
      />
      <h2 id="match">Match statement/expression</h2>
      <p>A match expression is written:</p>
      <div className="font-mono whitespace-pre-wrap">{`match(aOrB){
  case {left: l}:
    [statement list];
    break leftReturn;
  case {right: r}:
    [statement list];
    break rightReturn;
}`}</div>
      <p>Where:</p>
      <ol>
        <li>
          <code>l</code> and <code>r</code> are identifiers.
        </li>
        <li>
          <code>aOrB</code>, <code>leftReturn</code>, and{" "}
          <code>rightReturn</code> are expressions.
        </li>
      </ol>
      <p>It's well-typed if:</p>
      <ol>
        <li>
          <code>aOrB</code> has type <code>A || B</code>
        </li>
        <li>
          There is a type <code>R</code> such that:
        </li>
        <ul>
          <li>
            Given <code>l: A</code> in the context, <code>leftReturn</code> has
            type <code>R</code>.
          </li>
          <li>
            Given <code>r: B</code> in the context, <code>rightReturn</code> has
            type <code>R</code>.
          </li>
        </ul>
      </ol>
      <p>
        Then the type of the match expression is <code>R</code>.
      </p>
      <p>
        Match can also be used as a statement. Then it's basically equivalent to
        a return/continue/break statement with a match expression as the value,
        except that instead of ending cases with <code>break</code>, we end them
        with return/continue/break respectively.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`function example(aOrB: 0 == 0 || 0 == 1): 0 == 0 {
  match(aOrB){
    case {left: l}:
      return l;
    case {right: r}:
      return eqRefl(0);
  }
}`}
      />
      <h2 id="never">Type "never"</h2>
      <p>
        <code>never</code> is a type representing logical contradiction. Given{" "}
        <code>x: never</code>, <code>{`neverElim<T>(x)`}</code> has type{" "}
        <code>T</code>. The generic argument can also be inferred.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const x: never = sorry;
const example: 0 == 1 = neverElim(x);`}
      />
      <h2 id="typedef">Type definitions</h2>
      <p>You can define a shorthand for a type like in TypeScript:</p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`type MyType = 0 == 0;
const example: MyType = eqRefl(0);`}
      />
      <h2 id="generic-types">Generic types</h2>
      <p>
        Defined types can take zero or more generic arguments. These have to be
        declared as either <code>extends N</code> for arithmetic expression
        arguments or <code>extends Prop</code> for proposition type arguments.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`type MyGenericType<n extends N, p extends Prop> = n == n && p;
const example: MyGenericType<7, 0 == 0> = eqRefl(7) && eqRefl(0);`}
      />
      <h2 id="operator-as">Operator "as"</h2>
      <p>
        Given an expression <code>expr</code> and a type <code>T</code>,{" "}
        <code>expr as T</code> has type <code>T</code> if <code>expr</code>
        can be interpreted as type <code>T</code>. This is the same as type
        annotations, but can be used in expression context.
      </p>
      <CodeMirrorComponent
        readOnly
        initialDoc={`const example = {left: eqRefl(0)} as 0 == 0 || 7 == 9;`}
      />
      <h2 id="magic">Magic built-ins</h2>
      <p>The following compiler magic is available:</p>
      <ol>
        <li>
          For a type <code>T</code>, the expression{" "}
          <code>{`excludedMiddle<T>`}</code> has type <code>T || !T</code>.
        </li>
        <li>
          The placeholder value <code>sorry</code> has type <code>any</code>.
          This type can be converted into anything.
        </li>
        <li>
          For <code>eq: A == B</code>, <code>ring(eq)</code> has type{" "}
          <code>{`rung<A == B>`}</code>. This type can be converted to{" "}
          <code>C == D</code>
          if <code>A - B</code> equals <code>C - D</code> or <code>D - C</code>,
          considering them as polynomials.
        </li>
        <li>
          For <code>prop: T</code> and <code>eq: x == B</code> where{" "}
          <code>x</code> is a variable and <code>B</code>
          is an expression, <code>replaceAll(prop, eq)</code> has type{" "}
          <code>T[x:=B]</code>.
        </li>
        <li>
          If <code>GT</code> is the name of a generic type with a single
          argument of kind <code>N</code>, <code>{`replace<GT>`}</code> has type{" "}
          <code>{`(L: N, R: N, eqLR: L == R, propOfL: GT<L>) => GT<R>`}</code>.
        </li>
      </ol>
    </div>
  );
}
