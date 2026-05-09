import React, { useEffect, useState } from "react";
import type { Presupuesto } from "../types/Presupuesto";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "./NotificationModal";
import { UserSearch } from "./UserSearch";

export const PresupuestosPanel: React.FC = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notificación
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyType, setNotifyType] = useState<"success" | "error">("success");

  const navigate = useNavigate();

  // Busqueda
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get<Presupuesto[]>("http://localhost:3001/presupuestos")
      .then((response) => {
        setPresupuestos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching presupuestos: " + err.message);
        setLoading(false);
      });
  }, []);

  
  const handlerClickView = (id: number) => {
    navigate(`/adminPanel/presupuestos/vereditarpresupuesto/${id}`);
  };

  const handlerClickPrint = (id: number) => {
    navigate(`http://localhost:3001/presupuestos-pdf/${id}/pdf`)
  }
  const handlerClickDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/presupuestos/${id}`);
      setPresupuestos((prev) => prev.filter((p) => p.id !== id));

      // Mostrar notificación
      setNotifyTitle("Éxito");
      setNotifyMessage("Presupuesto eliminado correctamente");
      setNotifyType("success");
      setNotifyVisible(true);

      setTimeout(() => setNotifyVisible(false), 3000);
    } catch (error: unknown) {
      let message = "Error inesperado";
      if (axios.isAxiosError(error)) message = error.message;

      setNotifyTitle("Error");
      setNotifyMessage(message);
      setNotifyType("error");
      setNotifyVisible(true);

      setTimeout(() => setNotifyVisible(false), 3000);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const filteredPresupuestos = presupuestos.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto p-4 rounded-md shadow-amber-600 border border-orange-400">
        <div className="flex-row mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-200">Presupuestos</h2>

          {/* Componente de búsqueda */}
          <div className="flex justify-end mb-3">
            <div className="w-64">
              <UserSearch value={search} onChange={setSearch} />
            </div>
          </div>
        </div>
        <table className="min-w-full rounded-md border border-orange-400">
          <thead className="bg-orange-500 border border-orange-400">
            <tr className="border border-orange-400">
              <th className="px-4 py-2 text-left text-gray-700">Número</th>
              <th className="px-4 py-2 text-left text-gray-700">Cliente</th>
              <th className="px-4 py-2 text-left text-gray-700">Estado</th>
              <th className="px-4 py-2 text-left text-gray-700">Fecha</th>
              <th className="px-4 py-2 text-center text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="border border-orange-400">
            {filteredPresupuestos.map((p, index) => (
              <tr
                key={p.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
              >
                <td className="px-4 py-2 text-gray-700 border border-orange-400">
                  {p.numero_presupuesto}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400">
                  {p.cliente?.nombre ?? "Genérico"}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {p.estado}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400">
                  {new Date(p.fecha_creacion).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center border border-orange-400">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handlerClickPrint(p.id)}
                  >
                    Descargar
                  </button>

                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={() => handlerClickView(p.id)}
                  >
                    Ver
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded dark:bg-red-500 dark:hover:bg-red-600"
                    onClick={() => handlerClickDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast de notificación */}
      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </div>
  );
};
