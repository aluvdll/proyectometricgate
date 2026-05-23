import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  StickyNoteCheck,
  StickyNotePlus,
  ClipboardClock,
  UserRound,
  UserRoundPen,
  BookA,
  BookPlus,
  UserPlus,
  Notebook,
  NotebookPen,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function AdminPanel() {
  const [estaContraido, setEstaContraido] = useState(false);
  const { user: usuario } = useAuth();
  const rolUsuario = usuario?.role; // Admin | comercial | Tecnico
  const esAdmin = rolUsuario === "admin";
  const esComercial = rolUsuario === "commercial";
  const esTecnico = rolUsuario === "technician";
  const claseItemNav = `block py-2 px-3 rounded hover:bg-gray-800 hover:text-white ${
    estaContraido ? "text-center" : ""
  }`;
  const claseIcono = estaContraido ? "mx-auto" : "inline-block mr-2";
  console.log("USER EN CONTEXTO:", usuario);
  console.log("ROL:", usuario?.role);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pt-16">
      <aside
        className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-orange-400 text-gray-800 dark:bg-gray-400 flex flex-col transition-all duration-300 ${
          estaContraido ? "w-20" : "w-72"
        }`}
      >
        <div className="p-4 font-bold flex items-center justify-between text-2xl">
          {!estaContraido && (
            <div className="flex justify-center w-full">
              {/*Titulo dinamico segun rol*/}
              <span className="text-orange-600">
                {esAdmin
                  ? "Admin"
                  : esComercial
                    ? "Comer"
                    : esTecnico
                      ? "Tecni"
                      : ""}
              </span>
              Panel
            </div>
          )}

          <button
            type="button"
            onClick={() => setEstaContraido((anterior) => !anterior)}
            className="rounded p-2 hover:bg-gray-800 hover:text-white"
            aria-label={estaContraido ? "Expandir menu" : "Contraer menu"}
            title={estaContraido ? "Expandir menu" : "Contraer menu"}
          >
            {estaContraido ? (
              <ChevronsRight size={18} />
            ) : (
              <ChevronsLeft size={18} />
            )}
          </button>
        </div>

        <nav
          className={`flex-1 space-y-1 ${estaContraido ? "px-2" : "px-6"}`}
        >
          <Link to="/adminPanel" className={claseItemNav} title="Dashboard">
            <LayoutDashboard className={claseIcono} size={16} />
            {!estaContraido && "Dashboard"}
          </Link>

          {!esTecnico && (
            <Link
              to="/adminPanel/presupuestos"
              className={claseItemNav}
              title="Presupuestos"
            >
              <StickyNoteCheck className={claseIcono} size={16} />
              {!estaContraido && "Presupuestos"}
            </Link>
          )}

          {!esTecnico && (
            <Link
              to="/adminPanel/presupuestos/nuevopresupuesto"
              className={claseItemNav}
              title="Nuevo Presupuesto"
            >
              <StickyNotePlus className={claseIcono} size={16} />
              {!estaContraido && "Nuevo Presupuesto"}
            </Link>
          )}

          {/* Visible para admin, commercial y technician */}
          <Link
            to="/adminPanel/pedidos"
            className={claseItemNav}
            title="Pedidos"
          >
            <ClipboardClock className={claseIcono} size={16} />
            {!estaContraido && "Pedidos"}
          </Link>

          {(esAdmin || esComercial) && (
            <Link
              to="/adminPanel/clientes"
              className={claseItemNav}
              title="Clientes"
            >
              <UserRound className={claseIcono} size={16} />
              {!estaContraido && "Clientes"}
            </Link>
          )}

          {(esAdmin || esComercial) && (
            <Link
              to="/adminPanel/clientes/nuevocliente"
              className={claseItemNav}
              title="Nuevo Cliente"
            >
              <UserRoundPen className={claseIcono} size={16} />
              {!estaContraido && "Nuevo Cliente"}
            </Link>
          )}

          {(esAdmin || esComercial || esTecnico) && (
            <Link
              to="/adminPanel/articulos"
              className={claseItemNav}
              title="Articulos"
            >
              <BookA className={claseIcono} size={16} />
              {!estaContraido && "Articulos"}
            </Link>
          )}

          {esAdmin && (
            <Link
              to="/adminPanel/articulos/nuevoarticulo"
              className={claseItemNav}
              title="Nuevo Articulo"
            >
              <BookPlus className={claseIcono} size={16} />
              {!estaContraido && "Nuevo Articulo"}
            </Link>
          )}
          {esAdmin && (
            <Link
              to="/adminPanel/usuarios"
              className={claseItemNav}
              title="Usuarios"
            >
              <User className={claseIcono} size={16} />
              {!estaContraido && "Usuarios"}
            </Link>
          )}

          {esAdmin && (
            <Link
              to="/adminPanel/usuarios/nuevouser"
              className={claseItemNav}
              title="Nuevo Usuario"
            >
              <UserPlus className={claseIcono} size={16} />
              {!estaContraido && "Nuevo Usuario"}
            </Link>
          )}

          {esAdmin && (
            <Link
              to="/adminPanel/familias"
              className={claseItemNav}
              title="Familias"
            >
              <Notebook className={claseIcono} size={16} />
              {!estaContraido && "Familias"}
            </Link>
          )}

          {esAdmin && (
            <Link
              to="/adminPanel/familias/nuevafamilia"
              className={claseItemNav}
              title="Crear Familia"
            >
              <NotebookPen className={claseIcono} size={16} />
              {!estaContraido && "Crear Familia"}
            </Link>
          )}
        </nav>
      </aside>

      <main className="min-h-[calc(100vh-4rem)] flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
