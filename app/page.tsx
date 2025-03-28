import Link from "next/link";
import { CodeMirrorComponent } from "./src/codemirrorStuff/CodeMirrorComponent";

export default function Home() {
  return (
    <>
      <div className="prose prose-a:text-blue-700 prose-a:visited:text-purple-900 lg:prose-xl mx-auto">
        <div className="max-lg:px-3">
          <h1>PeanoScript: TypeScript but it's a theorem prover </h1>
          <p>PeanoScript is a theorem prover language based on:</p>
          <ol>
            <li>A TypeScript-like syntax</li>
            <li>First-order logic</li>
            <li>Peano axioms</li>
          </ol>
          <p>
            Because many programmers are at least somewhat familiar with these
            systems (even if they don't know it 🙂), PeanoScript is a great
            introduction to automated theorem proving.
          </p>
          <p>
            To make this introduction even smoother, it runs fully on the web,
            including an interpreter and an advanced language server.
          </p>
          <p>
            PeanoScript has good support for running proofs as programs, thanks
            to the{" "}
            <a
              href="https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence"
              target="_blank"
              rel="noopener noreferrer"
            >
              Curry-Howard correspondence
            </a>
            . Here is an example of a proof that every natural number is either
            even or odd, which is also a function that returns the parity of a
            number:
          </p>
        </div>
        <CodeMirrorComponent
          readOnly
          hideLineNumbers
          initialDoc={`function isEven(n: N)
  : {k: N; parity: k*2 == n || k*2 + 1 == n}
{
  return for(let i=0; 
    let accumulator={k: 0, parity: {left: ring()}}; 
    i<n; i++)
  {
    const {k, parity} = accumulator;

    match(parity){
      case {left: even}:
        continue {k: k, parity: {right: ring(even)}};
      case{right: odd}:
        continue {k: k+1, parity: {left: ring(odd)}};
    }
  };  
}
  
console.log(isEven(0));
console.log(isEven(107));
console.log(isEven(100));`}
        />
        <p className="max-lg:px-3">
          To learn PeanoScript, see the{" "}
          <Link href="/tutorial">interactive tutorial</Link>. There is also{" "}
          <Link href="/reference">reference</Link> with a condensed description
          of the language, and a <Link href="/playground">playground</Link>{" "}
          where you can try writing and running code.
        </p>
      </div>
    </>
  );
}
