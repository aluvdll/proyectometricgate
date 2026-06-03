import { useAuth } from "../../context/AuthContext";
import { BtnUserMenu } from "./BtnUserMenu";
import { Link, useLocation } from "react-router-dom";

export function MenuMobile({ open }) {
  const { isLogged, user } = useAuth();
  const location = useLocation();
  const rolUsuario = user?.role;
  const esAdmin = rolUsuario === "admin";
  const esComercial = rolUsuario === "commercial";
  const esTecnico = rolUsuario === "technician";
  const esRutaAdmin = location.pathname.startsWith("/adminPanel");
  const claseItem =
    "block px-3 py-2 rounded-md text-gray-900 hover:text-orange-500 hover:bg-amber-300";

  return (
    // Aquí yo muestro/oculto todo el bloque móvil en función del estado `open` del navbar.
    <div className={`md:hidden rounded-lg ${open ? "block" : "hidden"}`}>
      {/* Aquí yo limito la altura al viewport y activo scroll interno para que nunca se pierdan opciones al final. */}
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 pt-2 pb-4 space-y-2 border-t border-gray-200 block w-full text-center bg-yellow-200 rounded-lg">
        <>
          <a href="/" className={claseItem}>
            Inicio
          </a>
          <a href="#" className={claseItem}>
            Tarifas
          </a>
          <a href="#" className={claseItem}>
            Contacto
          </a>
        </>

        {/* Aquí yo agrego opciones del panel solo cuando hay sesión y estoy dentro de rutas de admin. */}
        {isLogged && esRutaAdmin && (
          <>
            <p className="mt-2 border-t border-gray-300 pt-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
              Menú panel
            </p>

            <Link to="/adminPanel" className={claseItem}>
              Dashboard
            </Link>

            {!esTecnico && (
              <Link to="/adminPanel/presupuestos" className={claseItem}>
                Presupuestos
              </Link>
            )}

            {!esTecnico && (
              <Link
                to="/adminPanel/presupuestos/nuevopresupuesto"
                className={claseItem}
              >
                Nuevo Presupuesto
              </Link>
            )}

            <Link to="/adminPanel/pedidos" className={claseItem}>
              Pedidos
            </Link>

            {(esAdmin || esComercial) && (
              <Link to="/adminPanel/clientes" className={claseItem}>
                Clientes
              </Link>
            )}

            {(esAdmin || esComercial) && (
              <Link
                to="/adminPanel/clientes/nuevocliente"
                className={claseItem}
              >
                Nuevo Cliente
              </Link>
            )}

            {(esAdmin || esComercial || esTecnico) && (
              <Link to="/adminPanel/articulos" className={claseItem}>
                Artículos
              </Link>
            )}

            {esAdmin && (
              <Link
                to="/adminPanel/articulos/nuevoarticulo"
                className={claseItem}
              >
                Nuevo Artículo
              </Link>
            )}

            {esAdmin && (
              <Link to="/adminPanel/usuarios" className={claseItem}>
                Usuarios
              </Link>
            )}

            {esAdmin && (
              <Link to="/adminPanel/usuarios/nuevouser" className={claseItem}>
                Nuevo Usuario
              </Link>
            )}

            {esAdmin && (
              <Link to="/adminPanel/familias" className={claseItem}>
                Familias
              </Link>
            )}

            {esAdmin && (
              <Link
                to="/adminPanel/familias/nuevafamilia"
                className={claseItem}
              >
                Crear Familia
              </Link>
            )}
          </>
        )}

        {/* Aquí yo muestro menú de usuario (incluye cerrar sesión) o botón de login según autenticación. */}
        {isLogged ? (
          <div className="pt-4 space-y-2">
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
