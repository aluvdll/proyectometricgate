import { useAuth } from "../context/AuthContext";
import { BtnUserMenu } from "./BtnUserMenu";

export function MenuMobile({ open }) {
  const { isLogged } = useAuth();

  return (
    <div className={`md:hidden rounded-lg ${open ? "block" : "hidden"}`}>
      <div className="px-4 pt-2 pb-4 space-y-2 border-t border-gray-200 block w-full text-center bg-yellow-200 rounded-lg">
        <a
          href="/"
          className="block px-3 py-2 rounded-md text-gray-900 hover:text-orange-500  hover:bg-amber-300"
        >
          Inicio
        </a>
        <a
          href="#"
          className="block px-3 py-2 rounded-md text-gray-900 hover:text-orange-500 hover:bg-amber-300"
        >
          Servicios
        </a>
        <a
          href="#"
          className="block px-3 py-2 rounded-md text-gray-900 hover:text-orange-500 hover:bg-amber-300"
        >
          Tarifas
        </a>
        <a
          href="#"
          className="block px-3 py-2 rounded-md text-gray-900 hover:text-orange-500 hover:bg-amber-300"
        >
          Contacto
        </a>
        {isLogged ? (
          <div className="flex justify-center pt-4 space-y-2">
            <BtnUserMenu />
          </div>
        ) : (
          <div className="pt-4 space-y-2">
            <a
              href="/login"
              className="block  text-center px-3 py-2 rounded-md border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-500 hover:text-white"
            >
              Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
