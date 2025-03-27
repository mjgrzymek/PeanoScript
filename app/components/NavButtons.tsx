"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavButtons() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? (<div className="border-indigo-600 text-indigo-600" />).props.className
      : (
          <div className="border-transparent text-gray-600 hover:text-indigo-600" />
        ).props.className;
  };

  return (
    <div className="mx-1 flex flex-col justify-between py-1 text-lg sm:flex-row sm:space-x-8">
      <Link
        href="/tutorial"
        className={`inline-flex items-center border-b-2 px-1 pt-1 font-medium ${isActive(
          "/tutorial",
        )}`}
      >
        Tutorial
      </Link>
      <Link
        href="/playground"
        className={`inline-flex items-center border-b-2 px-1 pt-1 font-medium ${isActive(
          "/playground",
        )}`}
      >
        Playground
      </Link>
      <Link
        href="/reference"
        className={`inline-flex items-center border-b-2 px-1 pt-1 font-medium ${isActive(
          "/reference",
        )}`}
      >
        Reference
      </Link>
    </div>
  );
}
