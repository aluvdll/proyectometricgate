import { useState } from "react";
import LOGO from "../assets/logo_MetricGate.svg";
import { MenuDescktop } from "./MenuDescktop";
import { AuthDescktop } from "./AuthDescktop";
import { BtnToggler } from "./BtnToggler";
import { MenuMobile } from "./MenuMobile";
import { BtnUserMenu } from "../components/BtnUserMenu";
import { useAuth } from "../context/AuthContext";


export function Nav() {
  const [open, setOpen] = useState(false);
  const { isLogged } = useAuth();

  return (
   <nav className="bg-white dark:text-gray-300 shadow w-full fixed top-0 left-0 z-50">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      {/* Logo */}
      <img src={LOGO} alt="Logo" className="h-16 w-auto" />

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <MenuDescktop />
            
            {isLogged ? <BtnUserMenu /> : <AuthDescktop />}
            
          </div>

          {/* Mobile Button */}
          <BtnToggler open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Mobile Menu */}
      <MenuMobile open={open} />
      
    </nav>
  );
}