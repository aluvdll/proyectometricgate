import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "../modals/NotificationModal";
import { UserSearch } from "../shared/UserSearch.jsx";
import { obtenerFamiliasArticulosEmpresa } from "../../services/familiasArticulos";

export function FamiliasArticulosPanel() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState("");
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
    obtenerFamiliasArticulosEmpresa()
      .then((data) => setFamilias(data))
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando familias",
          "error",
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const familiasFiltradas = useMemo(() => {
    if (!textoBusqueda.trim()) return familias;

    const filtro = textoBusqueda.toLowerCase();
    return familias.filter((familia) => {
      const fuente = [
        familia.name,
        familia.description,
        familia.active ? "activo" : "inactivo",
      ]
        .join(" ")
        .toLowerCase();

      return fuente.includes(filtro);
    });
  }, [familias, textoBusqueda]);

  if (cargando) {
    return <div className="container w-full mt-1">Cargando familias...</div>;
  }

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto rounded-md border border-orange-400 p-4 shadow-amber-600">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
            Familias
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-64">
              <UserSearch value={textoBusqueda} onChange={setTextoBusqueda} />
            </div>
            <button
              type="button"
              onClick={() => navigate("/adminPanel/familias/nuevafamilia")}
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Crear familia
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-orange-400">
          <table className="w-full min-w-[680px]">
            <thead className="border border-orange-400 bg-orange-500">
              <tr>
                <th className="px-3 py-2 text-left text-gray-800">Nombre</th>
                <th className="px-3 py-2 text-left text-gray-800">
                  Descripción
                </th>
                <th className="px-3 py-2 text-center text-gray-800">Estado</th>
                <th className="px-3 py-2 text-center text-gray-800">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="border border-orange-400">
              {familiasFiltradas.map((familia, index) => (
                <tr
                  key={familia.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
                >
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {familia.name}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-gray-700">
                    {familia.description || "-"}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                    {familia.active ? "Activa" : "Inactiva"}
                  </td>
                  <td className="border border-orange-400 px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/adminPanel/familias/vereditarfamilia/${familia.id}`,
                        )
                      }
                      className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {familiasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-600"
                  >
                    No hay familias para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default FamiliasArticulosPanel;
