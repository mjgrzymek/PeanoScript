import { ReactNode } from "react";
import { CodeMirrorComponent } from "../src/codemirrorStuff/CodeMirrorComponent";
import { docExamples } from "../src/docData/codeExamples";
import { string2Type } from "../src/language/engine/string2Type";
import { TypeScriptCode } from "../src/codemirrorStuff/TypeScriptCode";
import Link from "next/link";

function Prosify({ children }: { children?: ReactNode }) {
  return (
    <div className="prose prose-a:text-blue-700 prose-a:visited:text-purple-900 mx-auto px-3">
      {children}
    </div>
  );
}

function PeanoArithmetic() {
  return (
    <>
      <h2 id="peano-arithmetic">Peano Arithmetic</h2>
      <p>
        Peano arithmetic is a mathematical system that combines first-order
        logic with axioms about the natural numbers. To express the axioms, it
        uses the symbols
        <code>0</code> (zero), <code>succ</code> (the successor function a.k.a.
        {`"x+1"`}), <code>+</code> (addition), and
        <code>*</code> (multiplication).
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Axiom</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">Formal Notation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Successor is not zero</td>
            <td className="border p-2">
              For all natural numbers n, succ(n) is not equal to 0
            </td>
            <td className="border p-2 font-mono">∀n. succ(n) ≠ 0</td>
          </tr>
          <tr>
            <td className="border p-2">Successor injectivity</td>
            <td className="border p-2">
              For all natural numbers n and m, if succ(n) equals succ(m), then n
              equals m
            </td>
            <td className="border p-2 font-mono">
              ∀n, m. succ(n) = succ(m) → n = m
            </td>
          </tr>
          <tr>
            <td className="border p-2">Addition of zero</td>
            <td className="border p-2">
              For all natural numbers n, n + 0 equals n
            </td>
            <td className="border p-2 font-mono">∀n. n + 0 = n</td>
          </tr>
          <tr>
            <td className="border p-2">Addition of successor</td>
            <td className="border p-2">
              For all natural numbers n and m, n + succ(m) equals succ(n + m)
            </td>
            <td className="border p-2 font-mono">
              ∀n, m. n + succ(m) = succ(n + m)
            </td>
          </tr>
          <tr>
            <td className="border p-2">Multiplication by zero</td>
            <td className="border p-2">
              For all natural numbers n, n * 0 equals 0
            </td>
            <td className="border p-2 font-mono">∀n. n * 0 = 0</td>
          </tr>
          <tr>
            <td className="border p-2">Multiplication by successor</td>
            <td className="border p-2">
              For all natural numbers n and m, n * succ(m) equals (n * m) plus n
            </td>
            <td className="border p-2 font-mono">
              ∀n, m. n * succ(m) = n * m + n
            </td>
          </tr>
          <tr>
            <td className="border p-2">Induction Schema</td>
            <td className="border p-2">
              If a property φ holds for 0, and whenever it holds for n it also
              holds for succ(n), then it holds for all natural numbers
            </td>
            <td className="border p-2 font-mono">
              (φ(0) ∧ (∀n. φ(n) → φ(succ(n)))) → ∀n. φ(n)
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        It{`'`}s one of the simplest logical systems that still allows us to
        prove many interesting statements. In this tutorial, we will be using
        the above axioms, together with the rules of logic, to learn proving
        things to a computer.
      </p>
    </>
  );
}

function DependentTypesTable() {
  return (
    <>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-1"></th>
            <th className="border p-1">Non-dependent</th>
            <th className="border p-1">Dependent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-1 font-bold">Function</td>
            <td className="border p-1">
              <div className="flex flex-col items-center gap-0.5">
                <span className="">A → B</span>
                <span className="font-mono">(x: A) =&gt; B</span>
                <span>Example:</span>
                <span className="font-mono">(eq: 0 == 1) =&gt; 1 == 2</span>
              </div>
            </td>
            <td className="border p-1">
              <div className="flex flex-col items-center gap-0.5">
                <span className="">∀x. φ(x)</span>
                <span className="font-mono">(x: N) =&gt; φ(x)</span>
                <span>Example:</span>
                <span className="font-mono">(n: N) =&gt; n + 0 == n</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border p-1 font-bold">Pair</td>
            <td className="border p-1">
              <div className="flex flex-col items-center gap-0.5">
                <span className="">A ∧ B</span>
                <span className="font-mono">A && B</span>
                <span>Example:</span>
                <span className="font-mono">0 == 0 && 1 == 1</span>
              </div>
            </td>
            <td className="border p-1">
              <div className="flex flex-col items-center gap-0.5">
                <span className="">∃x. φ(x)</span>
                <span className="font-mono">{`{x: N; property: φ(x)}`}</span>
                <span>Example:</span>
                <span className="font-mono">{`{n: N; squaresToSelf: n*n == n}`}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function ForExplanation() {
  function Code({ children }: { children: ReactNode }) {
    return <code>{children}</code>;
  }
  const i = (
    <Code>
      <span className="font-mono font-normal text-gray-600 italic">i</span>
    </Code>
  );
  const acc = (
    <Code>
      <span className="font-mono font-normal text-gray-600 italic">acc</span>
    </Code>
  );
  const accType = (
    <Code>
      <span className="font-mono font-normal text-gray-600 underline">
        accType
      </span>
    </Code>
  );
  const bound = (
    <Code>
      <span className="font-mono font-bold text-gray-500">bound</span>
    </Code>
  );
  const base = (
    <Code>
      <span className="font-mono font-bold text-gray-500">base</span>
    </Code>
  );
  const newAcc = (
    <Code>
      <span className="font-mono font-bold text-gray-500">newAcc</span>
    </Code>
  );
  return (
    <>
      <p>We write a for loop expression as: </p>
      <pre className="border bg-white text-black">
        <span className="text-purple-800">for</span>(
        <span className="text-purple-800">let</span>{" "}
        <span className="text-gray-600 italic">i</span> = 0;{" "}
        <span className="text-purple-800">let</span>{" "}
        <span className="text-gray-600 italic">acc</span>:{" "}
        <span className="text-gray-600 underline">accType</span> ={" "}
        <span className="font-bold text-gray-500">base</span>;{" "}
        <span className="text-gray-600 italic">i</span> {"<"}{" "}
        <span className="font-bold text-gray-500">bound</span>;{" "}
        <span className="text-gray-600 italic">i</span>++){"{"}
        <span className="text-amber-900">{`\n    // (statements...)\n    `}</span>
        <span className="text-purple-800">continue</span>{" "}
        <span className="font-bold text-gray-500">newAcc</span>;{"\n}"}
      </pre>
      <p>Where:</p>
      <ol>
        <li>
          {i} and {acc} are identifiers.
        </li>
        <li>
          {accType} is a type dependent on {i}, for example{" "}
          <code>0 + i == i</code>. This represents a property of {i}, and {acc}{" "}
          is the proof that this property holds.
        </li>
        <li>
          {base} is an expression which is the initial value of {acc}. Becuase{" "}
          {i} is initially zero, the type of {base} is {accType}, but with {i}{" "}
          replaced by <code>0</code>. For example, if {accType} is{" "}
          <code>0 + i == i</code>, then the type of {base} must be{" "}
          <code>0 + 0 == 0</code>. This substitution is often written as{" "}
          <code>accType[i:=0]</code>.
        </li>
        <li>
          {bound} is an arithmetic expression. This is the final value of {i}{" "}
          when the for loop is completed.
        </li>
        <li>
          Inside the curly braces, we have access to the number variable {i} and
          to {acc} of type {accType}, as we declared. Because {i} will be
          incremented, we need to update {acc} to be a valid proof of the
          property for the new value of {i}. That is, we need to use a{" "}
          <code>continue newAcc;</code> statement, where {newAcc} is an
          expression with the type <code>accType[i:=succ(i)]</code>. For
          example, if {accType} is <code>0 + i == i</code>, then {newAcc} must
          be of type <code>0 + succ(i) == succ(i)</code>.
        </li>
      </ol>
      <p>
        The value of the for loop expression is the value of {acc} after running{" "}
        {bound} iterations of the for loop. The type of this value is{" "}
        <code>accType[i:=bound]</code>. For example, if {accType} is{" "}
        <code>0 + i == i</code> and {bound} is <code>n</code>, the type of the
        for loop expression is <code>0 + n == n</code>.
      </p>
      <p>
        If the desired type of the for expression is known and {bound} is a
        variable, {accType} can be guessed to be{" "}
        <code>desiredType[bound:=i]</code>. For example, in <code>zeroAdd</code>{" "}
        we return the for loop from a function with the return type annotation{" "}
        <code>0 + n == n</code>, and the bound is <code>n</code>. So even
        without a type annotation on {acc}, {accType} would be guessed to be{" "}
        <code className="whitespace-pre">(0 + n == n)[n:=i]</code> which is{" "}
        <code>0 + i == i</code>.
      </p>
    </>
  );
}

function Stuff() {
  return (
    <div className="pt-10 pb-64">
      <Prosify>
        {/* intro */}
        <h1> PeanoScript tutorial</h1>
        <p>
          PeanoScript is an experimental proof assistant for Peano Arithmetic
          based on TypeScript syntax, with the goal of being easy for
          programmers.
        </p>
        <p>Benefits from reading this page may include:</p>
        <ol>
          <li>You will be able to formally prove mathematical statements.</li>
          <li>
            You will be able to run your proofs{" "}
            <a
              href="https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence"
              target="_blank"
              rel="noopener noreferrer"
            >
              as programs
            </a>
            . For example, a proof of the infinitude of primes is also a program
            that takes a number <i>n</i> and returns a prime number greater than{" "}
            <i>n </i>.
          </li>
          <li>
            You will understand why some proofs are not programs (the difference
            between constructive and classical logic).
          </li>
          <li>
            You will learn what those "Pi types" and "Sigma types" people talk
            about are (it's actually simple).
          </li>
        </ol>
        <PeanoArithmetic />
        <h2 id="natural-numbers"> The natural numbers </h2>
        <p>
          The basic kind of object we're dealing with is a natural number. These
          are the numbers 0, 1, 2, 3, ... . We can assign them to variables
          using <code>const variableName = number;</code>.
        </p>
      </Prosify>
      {/**natural numbers */}
      <CodeMirrorComponent {...docExamples.numbers1} />
      <Prosify>
        <p>
          Every variable has a type, which can be seen by hovering it. We can
          optionally specify the type using
          <code>const variableName: type = number;</code>, though usually it
          will be inferred. The type of a number is just the number.
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.numbers2} />
      <Prosify>
        <p>
          We can also print variables and expressions using{" "}
          <code>console.log(thing);</code>. Because PeanoScript doesn't have
          input, the results are immediately known and displayed inside the
          editor.
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.numbers3} />
      <Prosify>
        <p>
          Arabic numerals in PeanoScript are actually syntax sugar for the more
          fundamental way of writing numbers using the successor function{" "}
          <code>succ</code>. We can write the numbers 0, 1, 2, 3, ... as 0,
          succ(0), succ(succ(0)), succ(succ(succ(0))), ... .
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.numbers4} />
      {/**arithmetic expressions */}
      <Prosify>
        <h2 id="arithmetic-expressions">Arithmetic expressions</h2>
        <p>
          We can also add and multiply numbers together, forming arithmetic
          expressions. The value of such an expression is a number. Its type is
          the literal expression, for example, the type of <code>1+1</code> is{" "}
          <code>1+1</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.expressions1} />
      <Prosify>
        <p>
          The order of operations is meaningful: <code>1+2+3</code> is
          interpreted as <code>(1+2)+3</code>, which is different from{" "}
          <code>1+(2+3)</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.expressions2} />
      {/**equality  */}
      <Prosify>
        <h2 id="equality">Equality</h2>
        <p>
          Another kind of object is a proposition, which is a statement about
          numbers. The most basic thing we can say is that two numbers are
          equal, which we write as <code>a == b</code>. When a variable has the
          type <code>a == b</code>, it means its value is a proof of{" "}
          <code>a == b</code>. For a number <code>x</code>, we can obtain a
          proof of <code>x == x</code> using <code>eqRefl(x)</code>. This stands
          for the <strong>refl</strong>exive property of <strong>eq</strong>
          uality, that is: for all x, x equals x.
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.equality1} />
      <Prosify>
        <p>
          The value of an equality is displayed as <code>(eq)</code>
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.equality2} />
      <Prosify>
        <p>
          We can obtain slightly more interesting equalities using the
          arithmetic-defining axioms. They can be accessed as the functions{" "}
          <code>addZero</code>, <code>addSucc</code>, <code>mulZero</code>, and{" "}
          <code>mulSucc</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// addZero(x) returns x + 0 == x
const sevenPlusZero: 7 + 0 == 7 = addZero(7);

// mulZero(x) returns x * 0 == 0
const sevenTimesZero: 7 * 0 == 0 = mulZero(7);


// addSucc(x, y) returns x + succ(y) == succ(x + y)
const sevenPlusFive: 7 + 5 == succ(7 + 4) = addSucc(7, 4);

// mulSucc(x, y) returns x + succ(y) == x*y + x
const sevenTimesFive: 7*5 == 7*4 + 7 = mulSucc(7, 4);`}
      />
      <Prosify>
        {/* <p>
          You might find it odd that <code>addSucc(7,4)</code> returns an
          equation about <code>7+5</code>, but this is necessary. On the right
          side of the equation, we have <code>succ(7+4)</code>. If{" "}
          <code>addSucc(7, 5)</code>
          returned <code>7 + 5 == succ(7 + 4)</code>, then{" "}
          <code>addSucc(7, 0)</code> would have to return
          <code>7 + 0 == succ(7 + -1)</code>. Negative numbers{" "}
          <s>don't exist</s> are more complex to deal with, so we stick to
          functions that avoid them.
        </p>*/}
        <p>Equality has some properties we can use:</p>
        <ul>
          <li>
            Symmetry: if <code>a == b</code>, then <code>b == a</code>. We can
            use this by calling <code>aEqualsB.symm()</code>.
          </li>
          <li>
            Transitivity: if <code>a == b</code> and <code>b == c</code>, then{" "}
            <code>a == c</code>. We can use this by calling{" "}
            <code>aEqualsB.trans(bEqualsC)</code>
          </li>
          <li>
            If <code>a == b</code> and <code>f</code> is a function, then{" "}
            <code>f(a) == f(b)</code>. We can use this by calling{" "}
            <code>aEqualsB.map(f)</code>, for example{" "}
            <code>aEqualsB.map(succ)</code>.
          </li>
        </ul>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// let's try to prove 1 + 1 == 2
const leftSide: 1 + 1 == succ(1 + 0)  =  addSucc(1, 0);
const onePlusZero: 1 + 0 == 1  =  addZero(1);
const rightSide: succ(1 + 0) == 2  =  onePlusZero.map(succ);

const onePlusOneIsTwo: 1 + 1 == 2  =  leftSide.trans(rightSide);`}
      />
      <Prosify>
        <p>
          And just like that, we've breezed through the first 760 pages of{" "}
          <a
            href="https://en.wikipedia.org/wiki/Principia_Mathematica"
            target="_blank"
            rel="noopener noreferrer"
          >
            Principia Mathematica
          </a>
          !
        </p>
        {/**Sorry */}

        <h2 id="sorry">Apologizing to the compiler</h2>
        <p>
          Sometimes when we write a proof, we aren't sure how to complete a
          given part. We can use <code>sorry</code> whenever we need some
          proposition, and it will be accepted by the compiler.{" "}
          <code>sorry</code> is like a variable of type <code>any</code> in
          TypeScript, which can be implicitly converted into any other type.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const oneIsOne: 1 == 1 = sorry;

// a proof did not fit in this editor window
const oneIsZero: 1 == 0 = sorry; 

// we can use our fake proofs
const twoIsOne: 2 == 1 = oneIsZero.map(succ);`}
      />
      <Prosify>
        <p>
          This document has some exercises so you can make sure you follow. They
          work by asking you to replace the <code>sorry</code> in some code with
          real proofs. Try it now!
        </p>
      </Prosify>
      {/*TODO exercise*/}
      <CodeMirrorComponent
        initialDoc={`const fortyIsForty: 40 == 40 = sorry;`}
        saveAs="fortyIsForty"
        exercise={{
          solution: "const fortyIsForty: 40 == 40 = eqRefl(40);",
          varName: "fortyIsForty",
          varType: string2Type("40 == 40"),
        }}
      />
      <Prosify>
        <p>And a bonus challenge exercise:</p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc="const twoPlusTwo: 2 + 2 == 4 = sorry;"
        saveAs="twoPlusTwo"
        exercise={{
          solution: `const a = addSucc(2,1);
const b = addSucc(2,0).map(succ);
const c = addZero(2).map(succ).map(succ);
const twoPlusTwo: 2 + 2 == 4 = a.trans(b).trans(c);`,
          varName: "twoPlusTwo",
          varType: string2Type("2 + 2 == 4"),
        }}
      />
      {/**Implication */}
      <Prosify>
        {" "}
        <h2 id="implication"> Functions are implications </h2>
        <p>
          In logic, there is an important concept of implication ("A → B"). We
          can prove A → B by assuming A and proving B under that assumption.
          Then given a proof of A → B and a proof of A, we can combine them to
          obtain a proof of B.
        </p>
        <p>
          This is{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://en.wikipedia.org/wiki/Isomorphism"
          >
            much like
          </a>{" "}
          the concept of a function with a parameter of type A and return type
          B:
        </p>
        <TypeScriptCode
          code={`// TypeScript

function toUnary(num: number){
    // we "assume" a variable of type number

    // under this assumption, we create a string
    const unaryString = "1".repeat(num);
    return unaryString;
}
const seven: number = 7;

// combining number → string with a number, we get a string
const unarySeven: string = toUnary(seven);} />
`}
        />
        <p>
          In most programming, we mostly care about the implementation of a
          function. The fact that a function can be used to obtain a given
          result type is trivial, since all types have instances: for example,
          we can obtain a string with <code>"abc"</code>. In PeanoScript, a type
          like <code>0 == 1</code> represents a false proposition, and therefore
          can't be instantiated (without using <code>sorry</code>). That makes
          it interesting to explore the implications, that is functions, between
          types.
        </p>
        {/*maybe example with hash set and order set*/}
        <p>
          Like in TypeScript, we write the type of a function together with an
          argument name, though the name is not meaningful and might as well be
          "_". For example, the type of a function from A to B can be written{" "}
          <code>{`(a: A) => B`}</code> or <code>{`(_: A) => B`}</code>.
        </p>
        <p>
          We write a function using arrow/lambda notation, for example{" "}
          <code>{`(a: A) => ...`}</code>. The "..." can be an expression or a
          curly brace block with a return statement. We can optionally specify
          the return type like <code>{`(a: A): B => ...`}</code>, though usually
          it will be inferred.
        </p>
        <p>
          To create a variable that is a function, we can use the shorthand
          syntax <code>{`function funcName(a: A): B{...}`}</code>.
        </p>
        <p>
          To work with functions, we will want to make use of the type panel on
          the right of the code editor. The panel shows variables we have in the
          current context and the type we want to return from the current block
          or expression. Variables defined at the top level are omitted, with
          the hope that you write type annotations for those.
        </p>
        <p>
          Because the type panel only works on valid code, you will want to use
          a lot of <code>sorry</code> and <code>return sorry;</code>, and
          gradually de-sorrify your code as you go.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// these 4 declarations are the same
const example1: (_: 0 == 0) => 1 == 1
  = x => eqRefl(1);

const example2 = (x: 0 == 0) => eqRefl(1);

const example3 = (x: 0 == 0) => {
  return eqRefl(1);
}; // <-- no semicolon insertion, const statement must end in ;

function example4(x: 0 == 0): 1 == 1 {
  return eqRefl(1); 
}


// there can be many ways to implement an implication
function differentExample(x: 0 == 0): 1 == 1 {
  return x.map(succ);
}

// to get the result, we just call the function with the required type
const oneIsOne = example1(eqRefl(0));

// we can also have implications between things we
// don't know how to prove (perhaps because they're false)
function curiousExample(oneIsZero: 1 == 0): 2 == 1 {
  return oneIsZero.map(succ);
}

// we can call with sorry if we don't know how to create the argument
const twoIsOne: 2 == 1 = curiousExample(sorry);

// printing a function doesn't display anything interesting
console.log(example1);
`}
      />
      <Prosify>
        <p>
          We can also have implications where the left or right side is an
          implication. This corresponds to a function where the parameter or
          return value is a function.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// here, we take a function and return it
function example1(x: (_: 0 == 0) => 1 == 1)
  : (_: 0 == 0) => 1 == 1
{
  return x;
}

const example2 = (x: (_: 1 == 2) => 4 == 8)
  => (zeroIsOne: 0 == 1): 5 == 9  => 
{
    const a: 1 == 2 = zeroIsOne.map(succ);
    const b: 4 == 8 = x(a);
    const c: 5 == 9 = b.map(succ);
    return c;
};
`}
      />
      <Prosify>
        We can now add <code>succInj</code> to our axiomatic repertoire:
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// succInj(x,y) returns (_: succ(x) == succ(y)) => x == y
const inj: (_: 3 == 3) => 2 == 2 = succInj(2, 2);

const twoIsTwo: 2 == 2 = inj(eqRefl(3));`}
      />
      <Prosify>
        <h2 id="currying">Multi-argument functions and currying</h2>
        <p>
          PeanoScript uses currying, a technique where multi-argument functions
          are represented as chained single-argument functions. For example,
          instead of <code>{`(x, y) => ...`}</code>, we may have{" "}
          <code>{`x => y => ...`}</code>. This is occasionally convenient
          because we can make use of a partially applied function:
        </p>
        <TypeScriptCode
          code={`// TypeScript
const add = (x: number) => (y: number) => x + y;

function add7(array: number[]){
  return array.map(add(7));
}`}
        />
        <p>
          However, defining and calling functions this way is rather
          un-ergonomic. For this reason, we can use the usual multi-argument
          syntax, it's just defined to do the same thing as the curried version.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const uncurriedCall: 1 + 1 == succ(1 + 0) = addSucc(1, 0);
// is the same thing as
const curriedCall: 1 + 1 == succ(1 + 0) = addSucc(1)(0);

function multiArg(a: 1 + 2 == 3, b: 3 == 2 + 1): 1 + 2 == 2 + 1{
  return a.trans(b);
}`}
      />
      {/**TODO exercise? seems unfun without numbers */}
      {/**For all */}
      <Prosify>
        <h2 id="for-all">For all n</h2>
        <p>
          In logic, there is a concept of the universal quantifier "∀" (for
          all). It can be used to express that something is true for all
          numbers. For example, to say that for all n, n*2 == n + n, we can
          write: "∀n. n*2 = n + n". In fact, we've already been using ∀:{" "}
          <code>eqRefl</code> is written as "∀n. n = n", and{" "}
          <code>addSucc</code> is written as "∀n. ∀m. n + succ(m) = succ(n +
          m)".
        </p>
        <p>
          It makes sense that we can call <code>eqRefl</code> with some number
          and get the self-equality for that number. However, there is a
          difference with the usual functions/implications. Normally a function
          has some return type, and whatever we call it with, it will return
          that type. But what <code>eqRefl</code> returns depends on the
          argument. This is called a Pi type or a dependent function type.
        </p>
        <p>
          In PeanoScript, we write universal statements the same way as
          implications. To specify that the parameter type is a natural number,
          we write N (for ℕ, the natural numbers). For example, the type of
          <code>eqRefl</code> is written as <code>{`(x: N) => x == x`}</code>.
          We can even create our own version of <code>eqRefl</code>:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function myEqRefl(n: N): n == n {
  return eqRefl(n);
}

const sevenIsSeven: 7 == 7 = myEqRefl(7);`}
      />
      <Prosify>
        <p>
          Combining this with proposition arguments, we can prove interesting
          statements for arbitrary numbers:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function plus1IsSucc(n: N): n + 1 == succ(n) {
  const eq = addSucc(n,0);
  const eq2 = addZero(n).map(succ);
  return eq.trans(eq2);
}

function simplify(n: N, m: N, eq: n + 2 == m + 1): m == n + 1 {
  const eq2:     n + 2 == succ(m)  = eq.trans(plus1IsSucc(m));
  const eq3: succ(n+1) == succ(m)  = addSucc(n,1).symm().trans(eq2);
  const eq4:       n+1 == m        = succInj(n+1, m, eq3);
  return eq4.symm();
}
`}
      />
      <Prosify>
        <p>Try it in an exercise:</p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function simplify(n: N, eq: n + 1 == 8): n == 7 {
  return sorry;
}`}
        saveAs="forAllExercise"
        exercise={{
          solution: `function simplify(n: N, eq: n + 1 == 8): n == 7 {
  const eq2 = addSucc(n,0).symm().trans(eq);
  const eq3 = succInj(n+0, 7, eq2);
  const eq4 = addZero(n).symm().trans(eq3);
  return eq4;
}`,
          varName: "simplify",
          varType: string2Type("(n: N, eq: n + 1 == 8) => n == 7"),
        }}
      />
      <Prosify>
        <p>
          For manipulating types with variables in them, we can use another
          built-in function called <code>replaceAll</code>. Calling{" "}
          <code>replaceAll(p, eq)</code> where <code>p</code> is some
          proposition and <code>eq</code> is <code>var == Expr </code> will
          replace all occurrences of <code>var</code> in <code>p</code> with{" "}
          <code>Expr</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function replaceExample(n: N, m: N, eq1: n == succ(m), eq2: m == 6)
  : n == 7
{
  const result: n == 7 = replaceAll(eq1, eq2);
  return result;
}

// replaceAll also works on more complex types
function replace2(n: N, m: N, f: (_: m == n*2) => m == 0, eq: m == n)
  : (_ : n == n*2) => n == 0
{
  const fReplaced = replaceAll(f, eq);
  return fReplaced;
}`}
      />
      {/**For loop */}
      <Prosify>
        <h2 id="for-loop">"for" all n? 😏</h2>
        <p>
          For loops in programming are often used in a certain pattern: we
          iterate over some range of numbers, and accumulate a result in an
          outside variable.
        </p>
        <TypeScriptCode
          code={`// TypeScript

function sumUpToN(n: number){
    let sum = 0;
    for(let i = 0; i < n; i++){
        sum += i;
    }
    return sum;
}`}
        />
        <p>The pattern is also used by the reduce function:</p>
        <TypeScriptCode
          code={`// TypeScript

function range(n: number) {
  return [...Array(n).keys()];
}

function sumUpToN(n: number) {
  return range(n).reduce((sum, i) => sum + i, 0);
}`}
        />
        <p>
          Given this pattern, we could imagine another version of the for loop:
        </p>
        <ol>
          <li>
            We would declare an additional variable inside the for loop for the
            accumulator. (<code>let i = 0; let sum = 0;</code>)
          </li>
          <li>
            The continue statement would take a value like{" "}
            <code>continue sum + i;</code>. The loop body would have to end in a
            continue, which would give the new value for the accumulator.
          </li>
          <li>
            The for loop would be an expression instead of a statement, and its
            value would be the final value of the accumulator.
          </li>
        </ol>
        <p>It would look like this:</p>
        <TypeScriptCode
          code={`// fake TypeScript
function sumUpToN(n: number) {
    return for(let i = 0; let sum = 0; i < array.length; i++){
        continue sum + i;
    };
}`}
        />

        <p>
          It's not clear if this idea will be accepted in mainstream programming
          languages. However, it's very useful for us now. Consider trying to
          prove something for all n, for example, that <code>0 + n == n</code>.
          This seems impossible to do with just <code>addZero</code> and{" "}
          <code>addSucc</code> - we would have to "move" n succs to the left of
          the <code>+</code> to use <code>addZero(n)</code>, but we can only
          write a finite amount of code.
        </p>
        <p>
          However, if we had a way to move a single succ to the left, we could
          apply it n times:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function zeroAdd(n: N): 0 + n == n {
  const base = addZero(0);
  return for(let i=0; let acc: 0 + i == i = base; i < n; i++){
    const acc2 = acc.map(succ);
    const newAcc: 0 + succ(i) == succ(i) = addSucc(0, i).trans(acc2);
    continue newAcc;
  };
};`}
      />
      <Prosify>
        <ForExplanation />
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function zeroAdd(n: N): 0 + n == n {
  const base = addZero(0);
  return for(let i=0; let acc = base; i < n; i++){
    const acc2 = acc.map(succ);
    const newAcc: 0 + succ(i) == succ(i) = addSucc(0, i).trans(acc2);
    continue newAcc;
  };
};`}
      />
      <Prosify>
        <p>Try the for loop in an exercise:</p>
      </Prosify>
      <CodeMirrorComponent
        saveAs="forExercise"
        initialDoc={`// tips: use mulZero, mulSucc, and addZero
// start with "let acc = sorry" and "continue sorry;"
function zeroMul(n: N): 0*n == 0 {
  return sorry;
}`}
        exercise={{
          solution: `// tips: use mulZero, mulSucc, and addZero
// start with "let acc = sorry" and "continue sorry;"
function zeroMul(n: N): 0*n == 0 {
  return for(let i=0; let acc = mulZero(0); i<n; i++){
    const eq = mulSucc(0, i);
    const eq2 = addZero(0*i);
    const eq3 = eq.trans(eq2).trans(acc);
    continue eq3;
  };
}`,
          varName: "zeroMul",
          varType: string2Type("(n: N) => 0*n == 0"),
        }}
      />
      <Prosify>
        <p>
          It's time to prove the commutative property of addition,{" "}
          <code>a + b == b + a</code>:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function succAdd(a: N, b: N): succ(a + b) == succ(a) + b {
  // since + is defined on succ(right side), we need to induct on b
  const base = addZero(a).map(succ).trans(addZero(succ(a)).symm());
  return for(let i=0; let acc = base; i < b; i++){
    const eq1 = addSucc(succ(a), i).symm();
    const eq2 = acc.map(succ).trans(eq1);
    const eq3 = addSucc(a, i).map(succ).trans(eq2);
    continue eq3;
  };  
}

function zeroAdd(n: N): 0 + n == n {
  const base = addZero(0);
  return for(let i=0; let acc: 0 + i == i = base; i < n; i++){
    const eq1 = acc.map(succ);
    const eq2 = addSucc(0, i).trans(eq1);
    continue eq2;
  };
}

function addComm(a: N, b: N): a + b == b + a {
  const base = zeroAdd(b).trans(addZero(b).symm());
  return for(let i=0; let acc=base; i<a; i++){
    const eq1 = addSucc(b, i).symm();
    const eq2 = acc.map(succ).trans(eq1);
    const eq3 = succAdd(i, b).symm().trans(eq2);
    continue eq3;
  };
}`}
      />
      <Prosify>
        {/**ring */}
        <h2 id="ring">Getting help</h2>
        <p>
          We could continue to prove the distributivity of addition ((a+b)+c ==
          a+(b+c)) and the same properties for multiplication. While that would
          be achievable, explicitly using these properties in proofs takes a lot
          of effort, which can be allocated to more interesting things.
        </p>
        <p>
          We can use the <code>ring</code> built-in to automatically transform
          an equation into an equivalent equation. This will work as long as the
          transformation is only composed of moving things around and{" "}
          <s>subtracting</s> un-adding things from both sides.
        </p>
        <p>
          To be precise, given a variable <code>eq</code> of type{" "}
          <code>A == B</code>, <code>ring(eq)</code> will be accepted as type{" "}
          <code>C == D</code> if A-B = C-D or A-B = D-C as polynomials.
        </p>
        <p>
          When the sides of an equation cancel out, we can use{" "}
          <code>ring()</code> as a shorthand for <code>ring(eqRefl(0))</code>
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// arithmetic is just the moving of succs
const eq7 : 7 == 2*3 + 1*1 = ring();

// free equations
function squaredSum(a: N, b: N)
  : (a+b)*(a+b) == a*a + 2*a*b + b*b
{
  return ring();
}

// transforming things
function myEq(a: N, b: N, eq: (a+b)*(a+b) == a*a + 2*a*b + 9)
  : b*b == 9 
{
  return ring(eq);
}
// by expanding the left side and
// un-adding a*a + 2*a*b from both sides,
// we get b*b == 9

// doesn't mean we get everything that's "easy"
function badEq(b: N, eq: b*b == 9): b == 3 {
  // b**2-9 is not the same polynomial as b-3
  return ring(eq); // error
}

function badEq2(a: N,
  b: N,
  c: N,
  offSwitch: N,
  eq: ((a+1)*(a+1)*(a+1) + (b+1)*(b+1)*(b+1))*offSwitch == (c+1)*(c+1)*(c+1)*offSwitch
)
  : offSwitch == 0
{
  return ring(eq); // error
}
  // by Fermat's last theorem for power 3,
  // eq and offSwitch == 0 are logically equivalent.
  // But we can't just get everything for free :)`}
      />
      <Prosify>
        <p>
          With <code>ring</code>, we can make use of the <code>as</code>{" "}
          keyword. In TypeScript, <code>someVar as someType</code> is used to
          assert that <code>someVar</code> is of type <code>someType</code>,
          even if the type system can't prove it. Since we require soundness,{" "}
          <code>as</code> is more of an inline type annotation.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function example(n: N, m: N, k:N, eq1: n == m + 1, eq2: 2 + m == k + 3)
  : n == k + 2
{
  return eq1.trans(ring(eq2) as m + 1 == k + 2);
}`}
      />
      <Prosify>
        {" "}
        <p>Try it out in an exercise:</p>{" "}
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function asExercise(n: N, m: N, eq1: n + m == m*2 + 3, eq2: m+3 == 7)
  : n == 7
{
  return sorry;
}`}
        saveAs="ringExercise"
        exercise={{
          solution: `function asExercise(n: N, m: N, eq1: n + m == m*2 + 3, eq2: m+3 == 7)
  : n == 7
{
  return (ring(eq1) as n == m+3).trans(eq2);
}`,
          varName: "asExercise",
          varType: string2Type(
            "(n: N, m: N, eq1: n + m == m*2 + 3, eq2: m+3 == 7) => n == 7",
          ),
        }}
      />
      {/**And ∧*/}
      <Prosify>
        <h2 id="and-types">And</h2>
        <p>
          Another common logical connective is the conjunction "∧" (and). We can
          prove that A ∧ B is true by proving A and proving B. Given A ∧ B, we
          can deduce A and we can also deduce B.
        </p>
        <p>
          This is similar to a data structure that simply holds two elements,
          with the types A and B. For example, consider the TypeScript type{" "}
          <code>{`type Person = {name: string; id: number}`}</code>. We can
          create an object of this type using some string and some number, for
          example <code>{`{name: "Alice", id: 7}`}</code>. Given an object of
          this type, say <code>person1 : Person</code>, we can retrieve a string
          and a number using <code>person1.name</code> and{" "}
          <code>person1.id</code>.
        </p>
        <p>
          TypeScript also has a suggestively named type operator <code>&</code>.{" "}
          It can merge two object types, for example, <code>Person</code> can
          also be written as <code>{`{name: string} & {id: number}`}</code>.
          However, this merging is a bit messier than the logical concept of
          And. If types <code>A</code> and <code>B</code> have a common
          property, it gets merged into one property in <code>A & B</code>,
          which means that creating an object of type <code>A & B</code> from{" "}
          <code>a : A</code> and <code>b : B</code> loses information.
        </p>
        <p>
          In PeanoScript, we use a "tagged" version of <code>&</code> written as{" "}
          <code>&&</code>. In TypeScript terms, the type <code>A && B</code> is{" "}
          <code>{`{left: A; right: B}`}</code>, which is also the same as{" "}
          <code>{`{left: A} & {right: B}`}</code>.
        </p>
        <p>
          We can create an object of type <code>A && B</code> using{" "}
          <code>a : A</code> and <code>b : B</code>. We write{" "}
          <code>{`{left: a, right: b}`}</code> or we can use the shorthand
          expression-level syntax <code>{`a && b`}</code>.
        </p>
        <p>
          To retrieve the proofs from <code>ab : A && B</code>, we can use{" "}
          <code>ab.left</code> and <code>ab.right</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const thing1: 0 == 0 && 1 == 1 = eqRefl(0) && eqRefl(1);
//also works with inference
const sameAsThing1 = eqRefl(0) && eqRefl(1);
const alsoSame = {left: eqRefl(0), right: eqRefl(1)};

const oneIsOne : 1 == 1 = thing1.right;

// if we don't know how to prove an && yet,
// we can start with sorry && sorry
const difficult: 0 == 1 && 2 + 2 == 5 = sorry && sorry;`}
      />
      <Prosify>
        <p>Try it out:</p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const myAnd: 7 == 7 && 40+2 == 42 = sorry;`}
        exercise={{
          solution: "const myAnd: 7 == 7 && 40+2 == 42 = eqRefl(7) && ring();",
          varName: "myAnd",
          varType: string2Type("7 == 7 && 40+2 == 42"),
        }}
      />
      <CodeMirrorComponent
        initialDoc={`function retrieval(x: N, y: N, equalities: y == x * 3 && x * 3 == 6)
  : y == 6
{
  return sorry;        
}`}
        exercise={{
          solution: `function retrieval(x: N, y: N, equalities: y == x * 3 && x * 3 == 6)
  : y == 6
{
  return equalities.left.trans(equalities.right);        
}`,
          varName: "retrieval",
          varType: string2Type(
            "(x: N, y: N, equalities: y == x * 3 && x * 3 == 6) => y == 6",
          ),
        }}
      />
      {/**Exists */}
      <Prosify>
        <h2 id="exists-types">Exists</h2>
        <p>
          In logic, there is an existential quantifier "∃" (exists). A statement
          like ∃n. n*n == n can be read as "there exists a number n such that
          n*n == n". To prove such a statement we need to present a number n and
          a proof that n*n == n. Thus we can think of the value as a pair of a
          number and a proof of some property of that number.
        </p>
        <p>
          We already have a way to represent pairs with &&. Recall the relation
          between implications such as <code>{`(eq: 0 == 1) => 1 == 2`}</code>{" "}
          and For All statements such as <code>{`(n: N) => n + 0 == 0`}</code>.
          Exists statements are a similarly "upgraded" version of And. They can
          also be called dependent pair types or Sigma types.
        </p>
        <p>
          Implications take in a proposition and return another proposition, and
          For All statements take in a number and return a proposition{" "}
          <em>about</em> that number. "And" statements store two propositions,
          and Exists statements store a number and a proposition <em>about</em>{" "}
          that number.
        </p>
        <DependentTypesTable />
        <p>
          We write the type of an Exists statement as an object where the first
          field has type <code>N</code>, and the second field expresses some
          property of the first field. For example, ∃n. n*n == 1 can be written
          as
          <code>{`{n: N; squaresToSelf: n*n == n}`}</code>. To create a value of
          this type, we write the object. The second field's type will have the
          number variable replaced with the actual number provided. For example,{" "}
          <code>{`{n: 1, squaresToSelf: ring()}`}</code> works because the
          required type of <code>squaresToSelf</code> is <code>1 * 1 == 1</code>{" "}
          which <code>ring()</code> can be converted to.
        </p>
        <p>
          Say we have defined{" "}
          <code>{`const myExists: {n: N; squaresToSelf: n*n == n} = {n: 1, squaresToSelf: ring()};`}</code>
          . How can we use it? With And, we used the dot syntax. However, it's
          not clear how it would work here: if we write <code>myExists.n</code>,
          we won't get <code>1</code>, as the type abstracts away the concrete
          number. So we can only get some unkown number.{" "}
          <code>myExists.squaresToSelf</code>
          would give us a proposition about some number, but we wouldn't have
          the number itself.
        </p>
        <p>
          We need to unpack both elements of the object at once. For this, we
          can use the TS/JS destructuring syntax. We write{" "}
          <code>{`const {n, squaresToSelf} = myExists;`}</code> to obtain a new
          number <code>n</code> and a proposition
          <code>squaresToSelf</code> which expresses a property of{" "}
          <code>n</code>.
        </p>
        <p>
          In the case that we already have one of those names in the context and
          don't want to overwrite it, we can use the renaming syntax{" "}
          <code>from: to</code> on one or both of the names. For example,
          <code>{`const {n: m, squaresToSelf} = myExists;`}</code> will bind the
          number to <code>m</code> instead of <code>n</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const example: {n: N; squaresToSelf: n*n == n}
  = {n: 1, squaresToSelf: ring()};
const {n, squaresToSelf} = example;
const {n: m, squaresToSelf: mIsCool} = example;
console.log(example, n, m);
`}
      />
      <Prosify>
        <p>
          Exists can be used to describe many useful properties. For example, to
          express that <code>n</code> is even, we can use the type
          <code>{`{half: N; isHalf: half*2 == n}`}</code>. To express{" "}
          <em>a ≤ b</em>, we can use{" "}
          <code>{`{difference: N; isDifference: a + difference == b}`}</code>.
        </p>
        <p>
          Here is an example showing that <code>n*(n+1)</code> is always even:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function triangularNumber(n: N): {half: N; isHalf: half*2 == n*(n+1)}{
  return for(let i=0; let acc = {half: 0, isHalf: ring()}; i < n; i++){
    const {half, isHalf} = acc;
    // half*2 == i*(i+1) == i*i + i
    // (i+1)*(i+2) == i*i + 3*i + 2 == half*2 + 2*i + 2
    //    == 2*(half + i + 1)
    continue {half: half + i + 1, isHalf: ring(isHalf)};
  };
}
console.log(triangularNumber(1));
console.log(triangularNumber(2));
console.log(triangularNumber(3));
console.log(triangularNumber(4));
console.log(triangularNumber(5));`}
      />
      <Prosify>
        <p>
          If you look at the <code>console.log</code> outputs, it looks like
          we've created a function that returns the sum <i>1+2+...+n</i>.
          Indeed, this is a known property of <i>n(n+1)/2</i>, and we can also
          see in the implementation that we're adding <i>i+1</i> to the
          accumulator in each iteration.
        </p>
        <p>
          This is how we can create interesting functions in PeanoScript - if we
          want a <i>N → N</i> function with some property, we can declare a
          function{" "}
          <code>{`(n: N) => {functionResult: N; propertyOfResult: ...}`}</code>.
          Then we just need to construct the result that we want.
        </p>
        <p>
          We can also use this to simply mess around with{" "}
          <code>console.log</code>. Consider that a given Exists type can have
          many implementations, for example,{" "}
          <code>{`{n: N; squaresToSelf: n*n == n}`}</code> can also be{" "}
          <code>{`{n: 0, squaresToSelf: ring()}`}</code>. In fact, the property
          can be completely trivial such as{" "}
          <code>{`{n: N; isSelf: n == n}`}</code> or even{" "}
          <code>{`{n: N; obvious: 0 == 0}`}</code>. We can use this to do
          arbitrary computations.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function factorial(n: N): {fact: N; obvious: 0 == 0}{
  return for(let i=0; let acc = {fact: 1, obvious: eqRefl(0)}; i<n; i++){
    const {fact, obvious} = acc;
    continue {fact: fact*(i+1), obvious: eqRefl(0)};
  };
}
console.log(factorial(3));
console.log(factorial(100));`}
      />
      <Prosify>
        <p>
          Unfortunately, we can't use this for anything in our proofs, as
          unpacking <code>factorial(n)</code> we'll get an opaque number and the
          information that 0 is equal to 0. There is an interesting definition
          of a factorial in the section "Infinitude of primes", as a number that
          is divisible by every number less or equal to <i>n</i>. Note that that
          definition also doesn't pin down the factorial function, as it is also
          satisfied by <i>n!*2</i> or <i>leastCommonMultiple(1,2,..., n)</i>.
        </p>
        <p>Try out the exercise:</p>
      </Prosify>
      {/*function addy(la: N, ra: N, lb: N, rb: N, eqa: la == ra, eqb: lb == rb)
  : la + lb == ra + rb {
  const changed = eqa.map((x:N) => x+lb);
  type hi<X extends N> = la + lb == ra + X;
  const lul = replace<hi>(lb, rb, eqb, changed);
  return lul;
}

function triangularNumber(n: N) : {half: N; isHalf: half*2 == n*(n+1)}{
  return for(let i=0; let h = {half: 0, isHalf: ring()}; i < n; i++){
    const {half, isHalf} = h;
    // half*2 == i*(i+1) == i*i + i
    // (i+1)*(i+2) == i*i + 3*i + 2 == half*2 + 2*i + 2
    //    == 2*(half + i + 1)
    continue {half: half + i + 1, isHalf: ring(isHalf)};
  };
}

function tetrahedralNumbers(n: N)
  : {sixth: N; isSixth: sixth*6 == n*(n+1)*(n+2)}
{
  return for(let i=0; let t={sixth: 0, isSixth: ring()}; i<n; i++){
    const {sixth, isSixth} = t;
    // sixth*6 
    //   == i*(i+1)*(i+2)
    //   == i**3 + 2*i**2 + i**2 + 2*i
    //   == i**3 + 3*i**2 + 2*i
    // (i+1)*(i+2)*(i+3)
    //   == i**3 + i**2 + 2*i**2 + 3*i**2 + 2*i + 3*i + 6*i + 6 
    //   == i**3 + 6*i**2 + 11*i + 6
    //   == sixth*6 + 3*i**2 + 9*i + 6
    //   == sixth*6 + 3*(i**2 + 3*i + 2)
    //   == sixth*6 + 3*((i+1)(i+2))
    //   == sixth*6 + 3*(2*triangular(i+1))
    //   == 6*(sixth + triangular(i+1))
    const {half, isHalf} = triangularNumber(i+1);
    const neww = sixth + half;
    const isHalf3 = isHalf.map((x:N) => x*3);
    const cool = addy(sixth*6, ((i * (i + 1)) * (i + 2)), 
        (((half * 2) * 3)), (((i + 1) * ((i + 1) + 1)) * 3)
        , isSixth, isHalf3);
    continue {sixth: neww, isSixth: ring(cool)};
  };
}

console.log(tetrahedralNumbers(1));
console.log(tetrahedralNumbers(2));
console.log(tetrahedralNumbers(3));
console.log(tetrahedralNumbers(4));*/}
      <CodeMirrorComponent
        initialDoc={`function almostTetrahedral(n: N)
  : {third: N; isThird: third*3 == n*(n+1)*(n+2)}
{
  return sorry;
}`}
        exercise={{
          solution: `function almostTetrahedral(n: N)
  : {third: N; isThird: third*3 == n*(n+1)*(n+2)}
{
  return for(let i=0; let acc = {third: 0, isThird: ring()}; i < n; i++){
    const {third, isThird} = acc;
    continue {third: third + (i+1)*(i+2), isThird: ring(isThird)};
  };
}`,
          varName: "almostTetrahedral",
          varType: string2Type(
            "(n: N) => {third: N; isThird: third*3 == n*(n+1)*(n+2)}",
          ),
        }}
        saveAs="almostTetrahedral"
      />
      {/**Or */}
      <Prosify>
        <h2 id="or-and-match">Or and Match</h2>
        <p>
          Yet another logical connective is ∨ (Or). We can prove A ∨ B by
          proving either A or B. Given A ∨ B, we can't deduce either of them
          back, since we don't know which one we put in 😉. However, if we also
          prove A → C and B → C together with A ∨ B, we can deduce C, as we've
          "covered both branches".
        </p>
        <p>
          Again, there is a similar concept in TypeScript, but we opt for a
          double-charactered tagged version. PeanoScript's <code>A || B</code>{" "}
          is equivalent to TypeScript's <code>{`{left: A} | {right: B}`}</code>,
          that is a value of this type is one of the objects{" "}
          <code>{`{left: A}`}</code> or <code>{`{right: B}`}</code>.
        </p>
        <p>
          (in actual TypeScript, we would probably write this as{" "}
          <code>{`{side: "left"; value: A} | {side: "right"; value: B}`}</code>,
          but the point is that it stores either A or B, and we can tell at
          runtime which one)
        </p>
        <p>
          To create a value of type <code>A || B</code>, we simply create one of
          the objects such as <code>{`{left: a}`}</code> or{" "}
          <code>{`{right: b}`}</code>. In contrast to most other values, the
          type cannot be inferred as the value doesn't have the other side of
          the <code>||</code>. Therefore creating Or values requires either a
          type annotation or <code>as</code> expression.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const myOr: 0 == 0 || 6 == 7 = {left: eqRefl(0)};
const myOr2 = {left: eqRefl(0)} as 0 == 0 || 6 == 7;`}
      />
      <Prosify>
        <p>
          To use a value of type <code>A || B</code>, we use a{" "}
          <code>match</code> statement. Match statements exist in languages such
          as Rust and Swift, and have even been{" "}
          <a
            href="https://github.com/tc39/proposal-pattern-matching"
            target="_blank"
            rel="noopener noreferrer"
          >
            proposed for JavaScript
          </a>
          . A match statement is like a more powerful switch statement that also
          works on objects. Importantly, it also allows to extract values from
          objects, much like JavaScript's object destructuring syntax.
        </p>
        <p>
          Here is an example of what a match statement could look like in
          TypeScript (if it existed):
        </p>
        <TypeScriptCode
          code={`//fake TypeScript

type Result = { status: "success"; value: number }
  | { status: "error"; errorMessage: string };

function showResult(result: Result): string {
  match(result) {
    case { status: "success", value: val }: 
      return \`The calculation succeeded with value: \${val}\`;
    case { status: "error", errorMessage: msg }: 
      return \`Calculation failed: \${msg}\`;
  }
}`}
        />
        <p>The PeanoScript match statement looks about the same:</p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function orderEquality(a: N, b: N, equals: a == b || b == a): a == b{
  match(equals){
    case {left: aEqualsB}: // binds equals.left to aEqualsB
      return aEqualsB;
    case {right: bEqualsA}: // binds equals.right to bEqualsA
      return bEqualsA.symm();
  }
}`}
      />
      <Prosify>
        <p>
          Since we return <code>a == b</code> in both branches, the match
          statement is valid and the function is well-typed. Note that{" "}
          <code>return</code> is part of the function syntax, if we did a match
          statement inside a for loop we would end our cases with{" "}
          <code>continue</code>.
        </p>
        <p>
          Since there are no side effects, the only point of a match statement
          is to escape the current function or for loop body with some value. If
          we'd like to use match for intermediary results, we can use a match
          expression. The value of a match expression comes from{" "}
          <code>break someValue;</code> statements in each branch.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function orderEquality2(a: N, b: N, equals: a == b || b == a): a == b{
  const result: a == b = match(equals){
    case {left: aEqualsB}:
      break aEqualsB;
    case {right: bEqualsA}:
      break bEqualsA.symm();
  };
  return result;
}`}
      />
      <Prosify>
        <p>
          We are now ready for a common Hello World of computer proofs. We can
          prove that every number is either even or odd, that is, for any n,
          there exists a k such that either k*2 == n or k*2 + 1 == n.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function evenOrOdd(n: N): {k: N; isHalf: k*2 == n || k*2 + 1 == n} {
  return for(let i=0; 
    let acc = {k: 0, isHalf: {left: ring()}}; 
    i<n; i++)
  {
    const {k, isHalf} = acc;
    match(isHalf){
      case {left: even}:
        continue {k: k, isHalf: {right: ring(even)}};
      case{right: odd}:
        continue {k: k+1, isHalf: {left: ring(odd)}};
    }
  };  
}
console.log(evenOrOdd(0));
console.log(evenOrOdd(107));
console.log(evenOrOdd(100));`}
      />
      <Prosify>
        <p>
          No{" "}
          <a
            href="https://www.npmjs.com/package/is-even"
            target="_blank"
            rel="noopener noreferrer"
          >
            is-even
          </a>{" "}
          needed! Feel free to try the exercise:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function divideByThree(n: N)
  : {k: N; isThird: k*3 == n || (k*3 + 1 == n || k*3+2 ==n)}
{
  // tip: nested destructuring is not yet available
  return sorry;
}
console.log(divideByThree(0));
console.log(divideByThree(107));
console.log(divideByThree(100));`}
        saveAs="divideByThree"
        exercise={{
          solution: `function divideByThree(n: N)
  : {k: N; isThird: k*3 == n || (k*3 + 1 == n || k*3+2 ==n)}
{
  // tip: nested destructuring is not yet available
  return for(let i=0; 
    let acc = {k: 0, isThird: {left: ring()}}; 
    i<n; i++)
  {
    const {k, isThird} = acc;
    match(isThird){
      case {left: even}:
        // if k*3 == n, then k*3 + 1 == n + 1
        continue {k: k, isThird: {right: {left: ring(even)}}};
      case{right: odd}:
        match(odd){
          case {left: even}:
            // if k*3 + 1 == n, then k*3 + 2 == n + 1
            continue {k: k, isThird: {right: {right: ring(even)}}};
          case{right: odd}:
            // if k*3 + 2 == n, then (k+1)*3 == n + 1
            continue {k: k+1, isThird: {left: ring(odd)}};
        }
    }
  };  
}
console.log(divideByThree(0));
console.log(divideByThree(107));
console.log(divideByThree(100));`,
          varName: "divideByThree",
          varType: string2Type(
            "(n: N) => {k: N; isThird: k*3 == n || (k*3 + 1 == n || k*3+2 ==n)}",
          ),
        }}
      />
      {/**Never */}
      <Prosify>
        <h2 id="never-type">False things are never true</h2>
        <p>
          Another important concept in logic is negation. We write ¬p for some
          proposition p to say that it is false. The related laws are:
        </p>
        <ol>
          <li> We prove ¬p by deriving a contradiction from p. </li>
          <li> Given p and ¬p, we can derive a contradiction. </li>
        </ol>
        <p>
          But what is a contradicion? It is simply a special proposition,
          commonly written as ⊥. It's a common convention to simply consider ¬p
          as a syntax sugar for p → ⊥, which conserves the above laws. The law
          of ⊥ is simple.
        </p>
        <ol>
          <li>(Principle of explosion) Given ⊥, we can conclude anything.</li>
        </ol>
        <p>
          Where can we get such a ⊥? In Peano arithmetic, we have to use an
          axiom, only one of which has ⊥ anywhere: ∀n. succ(n) ≠ 0, which
          desugars to ∀n. ¬(succ(n) = 0), which desugars to ∀n. succ(n) = 0 → ⊥.
        </p>
        <p>
          In TypeScript, there is a type called <code>never</code>. It's used
          for values that can't exist, for example, a function that loops
          forever has return type <code>never</code>.
        </p>
        <p>
          Given this definition, it's logical that type <code>never</code> has
          something of a principle of explosion
        </p>
        <TypeScriptCode
          code={`//TypeScript
function loopForever(): never {
  while (true) {
    console.log("looping");
  }
}
const x: string = loopForever();
// because loopForever never returns,
// we never break the type annotation on x, so this type checks`}
        />
        <p>
          In PeanoScript, we write the logical ⊥ as <code>never</code>. We can
          obtain it from the axiom <code>succNotZero</code> of type{" "}
          <code>{`(n: N) => succ(n) != 0 `}</code> which desugars to{" "}
          <code>{`(n: N) => !(succ(n) == 0)`}</code> which desugars to
          <code>{`(n: N) => (_: succ(n) == 0) => never`}</code>. When we have a
          value of type <code>never</code>, we can obtain a value of any type
          using
          <code>{`neverElim<anyType>(neverValue)`}</code>. The wanted type can
          also be inferred, giving <code>{`neverElim(neverValue)`}</code>.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const bad: never = sorry;

const oneNotZero: (is0: 1 == 0) => never = succNotZero(0);
const sameAsOneNotZero: 1 != 0 = succNotZero(0);

const threeNotOne: 3 != 1 = threeIsOne => {
  // assuming threeIsOne: 3 == 1
  
  const twoIsZero: 2 == 0 = ring(threeIsOne);

  // succ(1) != 0
  const twoNotZero: 2 != 0 = succNotZero(1);

  // contradiction
  return twoNotZero(twoIsZero);
};

// we can conclude anything
function bad(nineNotNine: 9 != 9)
  : {n: N; isSqrt2: n*n == 2}
{
  const contradiction = nineNotNine(eqRefl(9));
  return neverElim<{n: N; isSqrt2: n*n == 2}>(contradiction);
}

// neverElim can also infer the type
function worse(nineNotNine: 9 != 9)
  : {n: N; isSqrt2: n*n == 2}
{
  const contradiction = nineNotNine(eqRefl(9));
  return neverElim(contradiction);
}
// error
console.log(worse(sorry));


// proving non-equality:
function nNotSuccN(n: N): n != succ(n) {
  // n != succ(n) is (arg: n = succ(n)) => never,
  // so we return a function
  return nIsSuccN => {
    const zeroIsOne: 1 == 0 = ring(nIsSuccN);
    return succNotZero(0, zeroIsOne);
  };
}

// because of currying, this is the same function
function nNotSuccNv2(n: N, nIsSuccN: n == succ(n)): never {
  const zeroIsOne: 1 == 0 = ring(nIsSuccN);
  return succNotZero(0, zeroIsOne);
}`}
      />
      <Prosify>
        <p>
          Though type <code>never</code>, well, never does anything, we can use
          it to exclude unwanted possibilities. For example, we might wish to
          subtract numbers, but this is not possible in general as we're not
          allowed to obtain a negative number. But if we can prove that a number{" "}
          <i>n</i> is not equal to <i>0</i>, we can use this to obtain its
          predecessor:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function predecessor(n: N)
  : (notZero: n != 0) => {pred: N; isPred: succ(pred) == n}
{
  // to be able to prove it for 0, we curried the "nonZero" argument
  // so we'll be returning a function
  function base(notZero: 0 != 0): {pred: N; isPred: succ(pred) == 0}{
    return neverElim(notZero(eqRefl(0)));
  }

  return for(let i=0; let acc = base; i < n; i++){
    // proof for succ(i) is easy :)
    continue notZero => {pred: i, isPred: eqRefl(succ(i))};
  };
}

// we can make an uncurried definition
function nicerPredecessor(n: N, notZero: n != 0)
  : {pred: N; isPred: succ(pred) == n}
{
  return predecessor(n, notZero);
}

const sixNotZero: 6 != 0 = succNotZero(5);
console.log(predecessor(6, sixNotZero));
console.log(nicerPredecessor(6, sixNotZero));`}
      />
      <Prosify>
        <p>
          It's a curious case of induction where we don't use the inductive
          hypothesis (<code>acc</code> is not used in the loop body), only the
          fact that we need to prove the statement for <code>succ(i)</code>.
        </p>
        <p>
          For the exercise, we can try to prove that 1 is not an even number.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`// tip: use the for loop
function oneNotDouble(n:N): n*2 != 1 {
  return sorry;
}`}
        saveAs="oneNotDouble"
        exercise={{
          solution: `// tip: use the for loop
function oneNotDouble(n:N): n*2 != 1 {
  const base: 0*2 != 1 = 
    zeroIs1 => neverElim(succNotZero(0, ring(zeroIs1)));

  return for(let i=0; let acc=base; i<n; i++){
    continue doubledSuccIsOne => {
      const bad: succ(i*2) == 0 = ring(doubledSuccIsOne);
      return succNotZero(i*2, bad);
    };
  };
}`,
          varName: "oneNotDouble",
          varType: string2Type("(n:N) => n*2 != 1"),
        }}
      />
      {/**generics and replace */}
      <Prosify>
        <h2 id="generics">Type generics and replace</h2>
        <p>
          When doing math, we usually don't express everything with quantifiers
          over equalities between arithmetic expressions (even when we could).
          We use higher-level concepts, for example "a is less than b" or "p is
          prime". We can define such concepts using formulas such as
          "lessEqual(a, b) ≔ ∃k. a + k = b" or "isPrime(n) ≔ n ≠ 1 ∧ ∀a. ∀b. a *
          b = n → (a = 1 ∨ b = 1)". In PeanoScript, we can define such concepts
          as generic types.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`type lessEqual<a extends N, b extends N>
  = {diff: N; differBy: a + diff == b};

const threeLessThan7: lessEqual<3, 7>
  = {diff: 4, differBy: ring()};

type isPrime<n extends N> = n != 1  
  && ((a: N, b: N, _: a * b == n) => (a == 1 || b == 1));
  
// actually, it is better to build it up from other definitions
type divides<d extends N, n extends N> = {d2: N; p: d2 * d == n};
type nonTriviallyDivides<d extends N, n extends N>
  = d != 1 && d != n && divides<d, n>;
type isComposite<c extends N> = {d: N; p: nonTriviallyDivides<d, c>};
type betterIsPrime<n extends N> = n != 1 && !isComposite<n>;

const twoIsPrime: betterIsPrime<2> = sorry; // doesn't seem so easy
// (there is a proof in the section "Infinitude of primes")

// we can also create formulas based on propositions
type implies<P extends Prop, Q extends Prop> = (_: P) => Q;
const implication: implies<0 == 0, 1 == 1>
  = zeroIsZero => zeroIsZero.map(succ);
`}
      />
      <Prosify>
        <p>
          Formulas allow us to use the deepest and most fundamental law of
          equality. While <code>replaceAll</code> lets us replace all
          occurrences of a variable with something else, we might want to
          replace only some occurrences, or replace something that is not a
          variable (like n*n+7). Mathematically, if we have a formula φ, and A =
          B for arithmetic expressions A and B, and φ(A) is true, then φ(B) is
          true.
        </p>
        <p>
          To use this principle, we can define a formula Phi using a generic
          type <code>{`type Phi<n extends N> = ...;`}</code> and then write{" "}
          <code>{`replace<Phi>`}</code> to get a value of the type
          <code>{`(L: N, R: N, eqLR: L == R, propOfL: Phi<L>) => Phi<R>`}</code>
          .
        </p>
        <p>
          We can use <code>replace</code> to replicate every other
          equality-related function, except for <code>eqRefl</code>:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function myEqSymm(a: N, b: N, eq: a == b): b == a {
  const aIsA = eqRefl(a);
  type equalsA<X extends N> = X == a;
  // equalsA<a> is true, so we can deduce equalsA<b>
  const result: b == a = replace<equalsA>(a, b, eq, aIsA);
  return result;
}`}
      />
      <Prosify>
        <p>
          For an exercise, try proving the transitivity of equality using only{" "}
          <code>replace</code>:
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function myEqTrans(a: N,
  b: N,
  c: N,
  eqAB: a == b,
  eqBC: b == c): a == c
{
  return sorry;
}`}
        saveAs="myEqTrans"
        exercise={{
          solution: `function myEqTrans(a: N,
  b: N,
  c: N,
  eqAB: a == b,
  eqBC: b == c): a == c
{
  type equalsA<X extends N> = a == X;
  return replace<equalsA>(b, c, eqBC, eqAB);
}`,
          varName: "myEqTrans",
          varType: string2Type(
            "(a: N, b: N, c: N, eqAB: a == b, eqBC: b == c) => a == c",
          ),
        }}
      />
      {/**Excluded middle */}
      <Prosify>
        <h2 id="constructive-logic">
          Constructive logic vs the excluded middle
        </h2>
        <p>
          In classical logic, we can always get p or not p for any proposition
          p. Constructive logic famously rejects this. Consider that p could
          encode famous math problems like P != NP, or the halting of an
          arbitrary Turing machine. It does intuitively seem that such
          statements are either true or false, but being able to obtain a value
          of the type <code>p || !p</code> causes some problems. If we treat our
          proofs as programs, it would mean we could <code>console.log</code>{" "}
          such a value and magically obtain an answer to any question.
        </p>
        <p>
          We can access <code>{`p || !p`}</code> using{" "}
          <code>{`excludedMiddle<p>`}</code>, however, our code won't be
          runnable.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`const test: 2 == 2 || 2 != 2 = excludedMiddle<2 == 2>;

console.log(test);`}
      />
      <Prosify>
        <p>
          But don't we sometimes need a proposition to be either true or false?
        </p>
        <p>
          As it turns out, the lack of excluded middle does not stop us from
          getting <code>p || !p</code> for many propositions <code>p</code>.
          It's just that we have to prove it, that is prove either{" "}
          <code>p</code> or <code>!p</code>. If we can do this, we say that{" "}
          <code>p</code> is decidable.
        </p>
      </Prosify>
      <CodeMirrorComponent initialDoc="type decidable<p extends Prop> = p || !p;" />
      <Prosify>
        For most common properties involving the natural numbers, such as parity
        or primarity, we can prove that they are decidable for all n, e.g.{" "}
        <code>{`(n: N) => isPrime<n> || !isPrime<n>`}</code>. This basically
        means writing a type-safe algorithm that will return one of the options.
        We can start with a simple one: for any a and b, they're either equal or
        not.
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function zeroOrNot(x: N): 0 == x || 0 != x {
  return for(let i=0; let acc = {left: eqRefl(0)}; i<x; i++){
    continue {right: is0 => succNotZero(i, is0.symm())};
  };
}

function equalityDecidable(x : N): (y : N) => x == y || x != y{ 
    return for(
      let i = 0;
      let iAcc = zeroOrNot;
      i < x; i++
    ){
      continue y => for(let j = 0;
          let jAcc = {right: succNotZero(i)};
          j < y; j ++)
        {
          match(iAcc(j)){
            case {left: d}:
              continue {left: d.map(succ)};
            case {right: d}:
              continue {right: p => d(ring(p))};
          }
        }; 
  };
}
console.log(equalityDecidable(6,7));
console.log(equalityDecidable(7,7));`}
      />
      <Prosify>
        <p>
          It's a curious algorithm, basically using for loops to subtract 1
          until one of the numbers is 0. Here's what it would look like
          translated to JavaScript (<code>x == y || x != y</code> is represented
          as a boolean):
        </p>
        <TypeScriptCode
          code={`// JavaScript
function zeroOrNot(x) {
  let acc = true;
  for (let i = 0; i < x; i++) {
    acc = false;
  }
  return acc;
}

function equalityDecidable(x) {
  let iAcc = zeroOrNot;
  for (let i = 0; i < x; i++) {
    // since arrow functions capture by reference,
    // we need to save the current value of iAcc
    const iAccCopy = iAcc;
    iAcc = y => {
      let jAcc = false;
      for (let j = 0; j < y; j++) {
        jAcc = iAccCopy(j);
      }
      return jAcc;
    };
  }
  return iAcc;
}

function uncurried(x, y) {
  return equalityDecidable(x)(y);
}`}
        />
        <p>
          Try to prove the decidability of <code>{`lessEqual<a,b>`}</code>. It's
          similar to the decidability of equality, you don't need to use
          previous theorems.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`type lessEqual<a extends N, b extends N> = 
  {diff: N; isDiff: a + diff == b};

function lessEqualDecidable(a: N)
  : (b: N) => lessEqual<a,b> || !lessEqual<a,b>
{
  return sorry;
}`}
        saveAs="lessEqualDecidable"
        exercise={{
          solution: `type lessEqual<a extends N, b extends N> = 
  {diff: N; isDiff: a + diff == b};

function lessEqualDecidable(a: N)
  : (b: N) => lessEqual<a,b> || !lessEqual<a,b>
{
  function base(b: N): lessEqual<0,b> || !lessEqual<0,b> { 
    return {left: {diff: b, isDiff: ring()}};
  }
  return for(let iA=0; let accA= base; iA < a; iA++){
    function base2Helper(lessThan0: lessEqual<succ(iA), 0>): never{
      const {diff, isDiff} = lessThan0;
      return succNotZero(iA+diff, ring(isDiff));
    };
    continue b => for(let iB=0;
      let accB= {right: base2Helper};
      iB<b; iB++)
    {
      match(accA(iB)){
        case {left: less}:
          const {diff, isDiff} = less;
          continue {
            left: {
              diff: diff, 
              isDiff: ring(isDiff)
            }
          };
        case {right: notLess}:
          continue {right: isLess => {
            const {diff, isDiff} = isLess;
            return notLess({diff: diff, isDiff: ring(isDiff)});
          }};
      }
    };
  };
}
console.log(lessEqualDecidable(6,10));`,
          varName: "lessEqualDecidable",
          varType: string2Type(
            "(a: N, b: N) => {diff: N; isDiff: a + diff == b} || !{diff: N; isDiff: a + diff == b}",
          ),
        }}
      />
      {/**Infinitude */}
      <Prosify>
        <h2 id="infinitude">Cool thing: infinitude of primes</h2>
        <p>
          To showcase the capabilities of PeanoScript, here is a proof of the
          infinitude of primes. Since sets are not supported, we use the form
          "for all n, there exists a prime greater than n".
        </p>
      </Prosify>
      <CodeMirrorComponent {...docExamples.infinitude} />
      {/**Foot */}
      <Prosify>
        <h2 id="ending">What to do next</h2>
        <p>
          You may try things out and prove some theorems in PeanoScript.
          However, if you want to go deep, there are some limitations as the
          language is limited to first-order reasoning on natural numbers.
        </p>
        <p>
          The good version of this is called "type theory" or "dependently typed
          programming". It's a bit more of a mind shift, but hopefully what
          you've learned will help you understand it. Full dependently typed
          languages allow you to do pretty much any kind of math, as well as
          code up pretty much any program and prove its correctness.
        </p>
        <p>
          For a programmer-friendly introduction to dependent types, I recommend
          the book{" "}
          <a
            href="https://thelittletyper.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Little Typer
          </a>
          . For serious math and formal verification, the big thing seems to be
          Lean 4, you can see their{" "}
          <a
            href="https://leanprover-community.github.io/learn.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            list of resources
          </a>
          .
        </p>
        <p>Have fun!</p>
        <h2 id="bonus-exercise">Bonus exercises</h2>
        <p>
          If you're looking for inspiration, you can try these bonus exercises.
          They are not tested so they might be wrong and/or not humanly doable.
          You can paste them in the <Link href="/playground">playground</Link>{" "}
          and solve.
        </p>
      </Prosify>
      <CodeMirrorComponent
        initialDoc={`function sqrt2Irrational(p: N, q: N): (p+1)*(p+1) != 2*(q+1)*(q+1) {
  return sorry;
}

type divides<d extends N, n extends N> = {d2: N; p: d2 * d == n};
type lessEq<n extends N, m extends N>
  = {distance: N; differByDistance: n + distance == m};

function greatestCommonDivisor(a: N, b: N)
  : {
    gcd: N;
    isGcd:
      divides<gcd, a> && divides<gcd, b>
      && !{gcd2: N; alsoGcd:
        divides<gcd2, a> && divides<gcd2, b> && lessEq<gcd2+1, gcd>
      }
    }
{
  return sorry;
}

type nonTrivDivs<d extends N, n extends N>
  = d != 1 && d != n && divides<d, n>;
type isComposite<c extends N> = {d: N; p: nonTrivDivs<d, c>};
type isPrime<n extends N> = n != 1 && !isComposite<n>;

// ;)
function goldbachConjecture(n: N,
  isEven: {half: N; isHalf: half*2 == n},
  isLarge: lessEq<4,n>
) : {p1: N; prop: isPrime<p1>
      && {p2: N; goldbach: isPrime<p2> && p1+p2==n}}
{
  return sorry;
}

function AMGMinequality(x: N, y: N): lessEq<x*y*4, (x+y)*(x+y)>{
  return sorry;
} `}
      />
    </div>
  );
}
// ask on stack exchange about FOL vs Dependent. can for all work like that
function App() {
  return (
    <>
      <Stuff />
    </>
  );
}

export default App;
