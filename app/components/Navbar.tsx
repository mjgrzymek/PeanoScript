"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? (<div className="border-indigo-600 text-indigo-600" />).props.className
      : (
          <div className="border-transparent text-gray-600 hover:text-indigo-600" />
        ).props.className;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 justify-between sm:h-16">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/icon.svg"
                  alt="PeanoScript Logo"
                  width={32}
                  height={32}
                />
                <span className="ml-2 text-lg font-semibold">PeanoScript</span>
              </Link>
            </div>

            <div className="ml-6 flex flex-col text-base sm:flex-row sm:space-x-8">
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
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/mjgrzymek/PeanoScript"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Image
                src="/github-mark.svg"
                alt="GitHub Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="ml-1 font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
