import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AdminPanel() {
  const { user } = useAuth();
  const userRole = user?.role; // Admin | comercial | Tecnico
  const isAdmin = userRole === "admin";
  const isCommercial = userRole === "commercial";
  const isTechnician = userRole === "technician" || userRole === "tecnician";
  console.log("USER EN CONTEXTO:", user);
  console.log("ROL:", user?.role);

  return (
    <div className="flex min-h-screen items-start pt-16">
      <aside className="min-h-[calc(100vh-4rem)] bg-orange-400 text-gray-800 dark:bg-gray-500 flex flex-col">
        <div className="p-4 mt-6 font-bold flex justify-center text-2xl">
          {/*Titulo dinamico segun rol*/}
          <span className="text-orange-600">
            {isAdmin
              ? "Admin"
              : isCommercial
                ? "Comer"
                : isTechnician
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

          {!isTechnician && (
            <Link
              to="/adminPanel/presupuestos"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Presupuestos
            </Link>
          )}

          {!isTechnician && (
            <Link
              to="/adminPanel/presupuestos/nuevopresupuesto"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Presupuesto
            </Link>
          )}

          {/* Visible para admin, commercial y technician */}
          <Link
            to="/adminPanel/pedidos"
            className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
          >
            Pedidos
          </Link>

       

          {(isAdmin || isCommercial) && (
            <Link
              to="/adminPanel/clientes"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Clientes
            </Link>
          )}

          {(isAdmin || isCommercial) && (
            <Link
              to="/adminPanel/clientes/nuevocliente"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Cliente
            </Link>
          )}

          {(isAdmin || isCommercial || isTechnician) && (
            <Link
              to="/adminPanel/articulos"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Articulos
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/adminPanel/articulos/nuevoarticulo"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Articulo
            </Link>
          )}
             {isAdmin && (
            <Link
              to="/adminPanel/usuarios"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Usuarios
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/adminPanel/usuarios/nuevouser"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Nuevo Usuario
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/adminPanel/familias"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Familias
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/adminPanel/familias/nuevafamilia"
              className="block py-2 px-3 rounded hover:bg-gray-800 hover:text-white"
            >
              Crear Familia
            </Link>
          )}
        </nav>
      </aside>

      <main className="min-h-[calc(100vh-4rem)] flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
