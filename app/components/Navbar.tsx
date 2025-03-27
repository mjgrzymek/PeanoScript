import Image from "next/image";
import Link from "next/link";
import { NavButtons } from "./NavButtons";
import StarsNumber from "./StarsNumber";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-28 justify-between sm:h-20">
          <div className="flex w-full items-center justify-between">
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
            <NavButtons />
            <div className="flex flex-col items-center space-x-3">
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
              <StarsNumber />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
