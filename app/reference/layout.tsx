// app/tutorial/layout.jsx
import TutorialSidebar from "../components/Sidebar";

const sections = [
  {
    id: "axioms",
    title: "Axioms",
  },
  {
    id: "assignment",
    title: "Assignment",
  },
  {
    id: "arithmetic",
    title: "Arithmetic",
  },
  {
    id: "equality",
    title: "Equality",
  },
  {
    id: "functions",
    title: "Functions",
  },
  {
    id: "for-loop",
    title: "For loop",
  },
  {
    id: "and-types",
    title: "And types (&&)",
  },
  {
    id: "exists-types",
    title: "Exists types",
  },
  {
    id: "destructuring-assignment",
    title: "Destructuring assignment",
  },
  {
    id: "or-types",
    title: "Or types (||)",
  },
  {
    id: "match",
    title: "Match statement/expression",
  },
  {
    id: "never",
    title: 'Type "never"',
  },
  {
    id: "typedef",
    title: "Type definitions",
  },
  {
    id: "generic-types",
    title: "Generic types",
  },
  {
    id: "operator-as",
    title: 'Operator "as"',
  },
  {
    id: "magic",
    title: "Magic built-ins",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <TutorialSidebar initSections={sections} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
