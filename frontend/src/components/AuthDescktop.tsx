import type { JSX } from "react";
// import BtnRegis from "./BtnRegis";

export function AuthDescktop(): JSX.Element {
  return (
    <div className="hidden md:flex ml-auto space-x-8">
      <a
        href="/login"
        className="
  text-orange-500
  dark:text-orange-500
  hover:bg-orange-500
  hover:text-white
  dark:hover:text-white
  px-3 py-2
  border border-orange-500
  rounded-md
"
      >
        Login
      </a>
      {/* <BtnRegis texto="Regístrate" /> */}
    </div>
  );
}
