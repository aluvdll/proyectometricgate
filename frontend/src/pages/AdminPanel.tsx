import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminPanel() {
  const { user } = useAuth();
  const userRole = user?.role; // Admin | comercial | Tecnico
  console.log("USER EN CONTEXTO:", user);
  console.log("ROL:", user?.role);

  return (
    <div className="mt-10 flex">
      <aside className=" bg-orange-400 dark:bg-gray-500 text-gray-800 flex flex-col">
        <div className="p-4 mt-6 font-bold flex justify-center text-2xl">
          {/*Titulo dinámico según rol*/}
          <span className="text-orange-600">
            {userRole === "admin"
              ? "Admin"
              : userRole === "commercial"
                ? "Comer"
                : userRole === "tecnician"
                  ? "Tecni"
                  : ""}
          </span>
          Panel
        </div>

        <nav className="flex-1 px-6 pt-1 space-y-1">
          <Link
            to="/adminPanel"
            className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
          >
            Dashboard
          </Link>

          {(userRole === "admin" || userRole === "comercial") && (
            <Link
              to="/adminPanel/usuarios"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Usuarios
            </Link>
          )}

          {userRole === "admin" && (
            <Link
              to="/adminPanel/usuarios/nuevouser"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Usuario
            </Link>
          )}

          {userRole !== "Tecnico" && (
            <Link
              to="/adminPanel/presupuestos"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Presupuestos
            </Link>
          )}

          {userRole !== "Tecnico" && (
            <Link
              to="/adminPanel/presupuestos/nuevopresupuesto"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Presupuesto
            </Link>
          )}

          {(userRole === "admin" || userRole === "comercial") && (
            <Link
              to="/adminPanel/clientes"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Clientes
            </Link>
          )}

          {(userRole === "admin" || userRole === "comercial") && (
            <Link
              to="/adminPanel/clientes/nuevocliente"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Cliente
            </Link>
          )}
          {userRole === "admin" && (
            <Link
              to="/adminPanel/articulos"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Artículos
            </Link>
          )}
          {userRole === "admin" && (
            <Link
              to="/adminPanel/familias"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Familias
            </Link>
          )}
          {userRole === "admin" && (
            <Link
              to="/adminPanel/articulos/nuevoarticulo"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Artículo
            </Link>
          )}
          {userRole === "admin" && (
            <Link
              to="/adminPanel/familias/nuevafamilia"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Crear Familia
            </Link>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
