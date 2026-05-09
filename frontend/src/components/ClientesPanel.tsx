import React, { useEffect, useState } from "react";
import type { Cliente } from "../types/Cliente";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "./NotificationModal";
import { UserSearch } from "./UserSearch";

export const ClientesPanel: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
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
      .get<Cliente[]>("http://localhost:3001/clientes")
      .then((response) => {
        setClientes(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching clientes: " + err.message);
        setLoading(false);
      });
  }, []);

  const handlerClickView = (id: number) => {
    navigate(`/adminPanel/clientes/vereditarcliente/${id}`);
  };

  const handlerClickDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/clientes/${id}`);
      setClientes((prev) => prev.filter((c) => c.id !== id));

      // Mostrar notificación
      setNotifyTitle("Éxito");
      setNotifyMessage("Cliente eliminado correctamente");
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

  const filteredClientes = clientes.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto p-4 rounded-md shadow-amber-600 border border-orange-400">
        <div className="flex-row mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold  text-gray-700 dark:text-gray-200">Clientes</h2>

          {/* Componente de búsqueda */}
          <div className="flex justify-end ">
            <div className="w-64">
              <UserSearch value={search} onChange={setSearch} />
            </div>
          </div>
        </div>

        <table className="min-w-full rounded-md border border-orange-400">
          <thead className="bg-orange-500 border border-orange-400">
            <tr className="border border-orange-400">
              <th className="px-4 py-2 text-left text-gray-700">Nombre</th>
              <th className="px-4 py-2 text-left text-gray-700">Apellido</th>
              <th className="px-4 py-2 text-left text-gray-700">Apellido2</th>
              <th className="px-4 py-2 text-left text-gray-700">Dni</th>
              <th className="px-4 py-2 text-center text-gray-700">Telefono</th>
              <th className="px-4 py-2 text-center text-gray-700">Poblacion</th>
              <th className="px-4 py-2 text-center text-gray-700">Provincia</th>
              <th className="px-4 py-2 text-center text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="border border-orange-400">
            {filteredClientes.map((c, index) => (
              <tr
                key={c.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
              >
                <td className="px-4 py-2 text-gray-700 border border-orange-400">
                  {c.nombre}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400">
                  {c.apellido1}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {c.apellido2}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {c.dni}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {c.telefono}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {c.poblacion}
                </td>
                <td className="px-4 py-2 text-gray-700 border border-orange-400 capitalize">
                  {c.provincia}
                </td>

                <td className="px-4 py-2 text-center border border-orange-400">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={() => handlerClickView(c.id)}
                  >
                    Ver
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded dark:bg-red-500 dark:hover:bg-red-600"
                    onClick={() => handlerClickDelete(c.id)}
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
