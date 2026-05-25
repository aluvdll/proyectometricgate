import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "../modals/NotificationModal";
import { UserSearch } from "../shared/UserSearch.jsx";
import { useAuth } from "../../context/AuthContext";
import { obtenerArticulosEmpresa } from "../../services/articulos";
import { listarArticulosConfigurables } from "../../services/articulosConfigurables";

import { API_URL } from "../../services/apiBase";


export function ArticulosPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const esAdmin = user?.role === "admin";

  const [articulos, setArticulos] = useState([]);
  const [articulosConfigurables, setArticulosConfigurables] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [tabActiva, setTabActiva] = useState("standard");
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 2500);
  };

  useEffect(() => {
    Promise.all([obtenerArticulosEmpresa(), listarArticulosConfigurables()])
      .then(([articulosData, configurablesData]) => {
        setArticulos(articulosData);
        setArticulosConfigurables(configurablesData);
      })
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando artículos",
          "error",
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const articulosFiltrados = useMemo(() => {
    if (!textoBusqueda.trim()) return articulos;

    const filtro = textoBusqueda.toLowerCase();
    return articulos.filter((a) => {
      const fuente = [
        a.family?.name,
        a.code,
        a.name,
        a.description,
        a.base_price,
        a.tax_percentage,
        a.active ? "activo" : "inactivo",
      ]
        .join(" ")
        .toLowerCase();

      return fuente.includes(filtro);
    });
  }, [articulos, textoBusqueda]);

  const configurablesFiltrados = useMemo(() => {
    if (!textoBusqueda.trim()) return articulosConfigurables;

    const filtro = textoBusqueda.toLowerCase();
    return articulosConfigurables.filter((a) => {
      const fuente = [
        a.code,
        a.name,
        a.description,
        a.active ? "activo" : "inactivo",
      ]
        .join(" ")
        .toLowerCase();

      return fuente.includes(filtro);
    });
  }, [articulosConfigurables, textoBusqueda]);

  if (cargando) {
    return <div className="container w-full mt-1">Cargando artículos...</div>;
  }

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto rounded-md border border-orange-400 p-4 shadow-amber-600">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
            Artículos
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-64">
              <UserSearch value={textoBusqueda} onChange={setTextoBusqueda} />
            </div>
            {esAdmin && (
              <button
                type="button"
                onClick={() => navigate("/adminPanel/articulos/nuevoarticulo")}
                className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Nuevo artículo
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTabActiva("standard")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              tabActiva === "standard"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Estándar ({articulos.length})
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("configurable")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              tabActiva === "configurable"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Configurables ({articulosConfigurables.length})
          </button>
        </div>

        {tabActiva === "standard" && (
          <table className="min-w-full rounded-md border border-orange-400">
            <thead className="border border-orange-400 bg-orange-500">
              <tr>
                <th className="px-3 py-2 text-left text-gray-800">Imagen</th>
                <th className="px-3 py-2 text-left text-gray-800">Código</th>
                <th className="px-3 py-2 text-left text-gray-800">Familia</th>
                <th className="px-3 py-2 text-left text-gray-800">Nombre</th>
                <th className="px-3 py-2 text-center text-gray-800">Base</th>
                <th className="px-3 py-2 text-center text-gray-800">IVA</th>
                <th className="px-3 py-2 text-center text-gray-800">Estado</th>
                <th className="px-3 py-2 text-center text-gray-800">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="border border-orange-400">
              {articulosFiltrados.map((a, index) => (
                <tr
                  key={a.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
                >
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.image ? (
                      <img
                        src={`${API_URL}/storage/${a.image}`}
                        alt={a.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">Sin imagen</span>
                    )}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.code}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.family?.name || "Sin familia"}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.name}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {Number(a.base_price).toFixed(2)} €
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {Number(a.tax_percentage).toFixed(2)}%
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {a.active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/adminPanel/articulos/vereditararticulo/${a.id}`,
                        )
                      }
                      className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {articulosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-gray-600"
                  >
                    No hay artículos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {tabActiva === "configurable" && (
          <table className="min-w-full rounded-md border border-orange-400">
            <thead className="border border-orange-400 bg-orange-500">
              <tr>
                <th className="px-3 py-2 text-left text-gray-800">Código</th>
                <th className="px-3 py-2 text-left text-gray-800">Nombre</th>
                <th className="px-3 py-2 text-center text-gray-800">IVA</th>
                <th className="px-3 py-2 text-center text-gray-800">Estado</th>
                <th className="px-3 py-2 text-center text-gray-800">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="border border-orange-400">
              {configurablesFiltrados.map((a, index) => (
                <tr
                  key={a.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
                >
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.code}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {a.name}
                  </td>

                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {Number(a.tax_percentage || 0).toFixed(2)}%
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {a.active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/adminPanel/presupuestos/nuevopresupuesto`)
                      }
                      className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      Usar en presupuesto
                    </button>
                  </td>
                </tr>
              ))}

              {configurablesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-600"
                  >
                    No hay artículos configurables para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </div>
  );
}

export default ArticulosPanel;
