import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "../modals/NotificationModal";
import { UserSearch } from "../shared/UserSearch.jsx";
import { obtenerClientesEmpresa } from "../../services/clientes";


export const ClientesPanel = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fichaClienteDesplegable, setFichaClienteDesplegable] = useState(null);

  // Notificación
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState("");
  const [tituloNotificacion, setTituloNotificacion] = useState("");
  const [tipoNotificacion, setTipoNotificacion] = useState("success");

  const navigate = useNavigate();

  // Busqueda
  const [textoBusqueda, setTextoBusqueda] = useState("");

  useEffect(() => {
    obtenerClientesEmpresa()
      .then((response) => {
        setClientes(response);
        setCargando(false);
      })
      .catch((err) => {
        setError("Error cargando clientes: " + err.message);
        setCargando(false);
      });
  }, []);

  const editarCliente = (id) => {
    navigate(`/adminPanel/clientes/vereditarcliente/${id}`);
  };

  const alternarCliente = (id) => {
    setFichaClienteDesplegable((actual) => (actual === id ? null : id));
  };

  if (cargando) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const clientesFiltrados = clientes.filter((cliente) =>
    Object.values(cliente)
      .join(" ")
      .toLowerCase()
      .includes(textoBusqueda.toLowerCase()),
  );

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto rounded-md border border-orange-400 p-3 shadow-amber-600">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            Clientes
          </h2>

          {/* Componente de búsqueda */}
            <div className="flex items-center gap-2">
            <div className="w-56">
              <UserSearch value={textoBusqueda} onChange={setTextoBusqueda} />
            </div>

            {/* Botón para crear nuevo cliente, visible solo para admin*/}
            <button
              type="button"
              onClick={() => navigate("/adminPanel/clientes/nuevocliente")}
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {clientesFiltrados.length === 0 ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-4 text-center text-sm text-orange-800">
              No hay clientes que coincidan con la búsqueda.
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <article
                key={cliente.id}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center">
                    <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                      Cod. {cliente.client_number}
                    </span>

                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {cliente.nombre}
                    </h3>

                    <div className="min-w-33 text-left md:text-center">
                      <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                        {cliente.client_number === "00000"
                          ? ""
                          : `DNI: ${cliente.dni}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        className="rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                        onClick={() => editarCliente(cliente.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarCliente(cliente.id)}
                        className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        aria-expanded={fichaClienteDesplegable === cliente.id}
                      >
                        {fichaClienteDesplegable === cliente.id
                          ? "Ocultar"
                          : "Ver"}
                      </button>
                    </div>
                  </div>

                  {fichaClienteDesplegable === cliente.id && (
                    <div className="grid gap-1.5 border-t border-orange-100 pt-2 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-md bg-orange-50 px-2 py-1.5 sm:col-span-2 xl:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Direccion
                        </p>
                        <p className="text-xs text-gray-800">
                          {cliente.direccion}
                        </p>
                      </div>

                      <div className="rounded-md bg-orange-50 px-2 py-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Telefono
                        </p>
                        <p className="text-xs text-gray-800">
                          {cliente.telefono || "-"}
                        </p>
                      </div>

                      <div className="rounded-md bg-orange-50 px-2 py-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Telefono 2
                        </p>
                        <p className="text-xs text-gray-800">
                          {cliente.telefono2 || "-"}
                        </p>
                      </div>

                      <div className="rounded-md bg-orange-50 px-2 py-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Poblacion
                        </p>
                        <p className="text-xs text-gray-800">
                          {cliente.poblacion}
                        </p>
                      </div>

                      <div className="rounded-md bg-orange-50 px-2 py-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Provincia
                        </p>
                        <p className="text-xs text-gray-800">
                          {cliente.provincia}
                        </p>
                      </div>

                      <div className="rounded-md bg-orange-50 px-2 py-1.5 sm:col-span-2 xl:col-span-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
                          Email
                        </p>
                        <p className="text-xs text-gray-800 break-all">
                          {cliente.email || "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Toast de notificación */}
      {notificacionVisible && (
        <NotificationModal
          title={tituloNotificacion}
          message={mensajeNotificacion}
          type={tipoNotificacion}
        />
      )}
    </div>
  );
};
