import Sidebar from "../components/Sidebar";

const tutorialSections = [
  {
    id: "peano-arithmetic",
    title: "Peano Arithmetic",
  },
  {
    id: "natural-numbers",
    title: " The natural numbers ",
  },
  {
    id: "arithmetic-expressions",
    title: "Arithmetic expressions",
  },
  {
    id: "equality",
    title: "Equality",
  },
  {
    id: "sorry",
    title: "Apologizing to the compiler",
  },
  {
    id: "implication",
    title: " Functions are implications ",
  },
  {
    id: "currying",
    title: "Multi-argument functions and currying",
  },
  {
    id: "for-all",
    title: "For all n",
  },
  {
    id: "for-loop",
    title: '"for" all n? 😏',
  },
  {
    id: "ring",
    title: "Getting help",
  },
  {
    id: "and-types",
    title: "And",
  },
  {
    id: "exists-types",
    title: "Exists",
  },
  {
    id: "or-and-match",
    title: "Or and Match",
  },
  {
    id: "never-type",
    title: "False things are never true",
  },
  {
    id: "generics",
    title: "Type generics and replace",
  },
  {
    id: "constructive-logic",
    title: "Constructive logic vs the excluded middle",
  },
  {
    id: "infinitude",
    title: "Cool thing: infinitude of primes",
  },
  {
    id: "ending",
    title: "What to do next",
  },
  {
    id: "bonus-exercise",
    title: "Bonus exercises",
  },
];

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar initSections={tutorialSections} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
