// components/TutorialSidebar.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Section {
  id: string;
  title: string;
}

export default function Sidebar({ initSections }: { initSections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initSections);
  const [activeSection, setActiveSection] = useState<string>("");
  const blockObserver = useRef(false);

  useEffect(() => {
    const headings = document.querySelectorAll("h2");

    const sectionList = Array.from(headings).map((heading) => ({
      id:
        heading.id ||
        heading.textContent!.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: heading.textContent!,
    }));

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = sectionList[index].id;
      }
    });
    //console.log(sectionList);
    setSections(sectionList);

    const observer = new IntersectionObserver(
      (entries) => {
        if (blockObserver.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -80% 0%" },
    );

    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headings.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    blockObserver.current = true;
    setTimeout(() => {
      blockObserver.current = false;
    }, 500);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <nav className="hidden w-64 pr-8 md:block">
      <div className="sticky top-10">
        <h3 className="mb-4 text-lg font-semibold">Tutorial Sections</h3>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={`w-full cursor-pointer rounded px-2 py-1 text-left hover:bg-gray-100 ${
                  activeSection === section.id
                    ? "bg-indigo-50 font-medium text-indigo-600"
                    : "text-gray-700"
                } text-sm`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
