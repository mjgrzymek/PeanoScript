import { CodeMirrorComponent } from "../src/codemirrorStuff/CodeMirrorComponent";

export default function Playground() {
  return (
    <CodeMirrorComponent
      initialDoc={`function evenOrOdd(n: N): {k: N; isHalf: k*2 == n || k*2 + 1 == n} {
  return for(let i=0; 
    let p = {k: 0, isHalf: {left: ring()}}; 
    i<n; i++)
  {
    const {k, isHalf} = p;
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
      saveAs="playground"
      big
    />
  );
}
