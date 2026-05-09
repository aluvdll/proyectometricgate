import React, { useEffect, useState } from "react";
import type { Articulo } from "../types/Articulo";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "./NotificationModal";
import { UserSearch } from "./UserSearch";

export const ArticulosPanel: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notificación
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyType, setNotifyType] = useState<"success" | "error">("success");

  const navigate = useNavigate();

  // Búsqueda
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get<Articulo[]>("http://localhost:3001/articulos")
      .then((response) => {
        setArticulos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching artículos: " + err.message);
        setLoading(false);
      });
  }, []);

  const handlerClickView = (id: number) => {
    navigate(`/adminPanel/articulos/vereditararticulo/${id}`);
  };

  const handlerClickDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/articulos/${id}`);
      setArticulos((prev) =>
        prev.filter((a) => a.id_articulo !== id),
      );

      setNotifyTitle("Éxito");
      setNotifyMessage("Artículo eliminado correctamente");
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

  const filteredArticulos = articulos.filter((a) =>
    Object.values(a)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto p-4 rounded-md shadow-amber-600 border border-orange-400">
        <div className="flex-row mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Artículos</h2>

          <div className="flex justify-end">
            <div className="w-64">
              <UserSearch value={search} onChange={setSearch} />
            </div>
          </div>
        </div>

        <table className="min-w-full rounded-md border border-orange-400">
          <thead className="bg-orange-500 border border-orange-400">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700">Imagen</th>
              <th className="px-4 py-2 text-left text-gray-700">Modelo</th>
              <th className="px-4 py-2 text-left text-gray-700">Descripción</th>
              <th className="px-4 py-2 text-center text-gray-700">Precio</th>
              <th className="px-4 py-2 text-center text-gray-700">Acciones</th>
            </tr>
          </thead>

          <tbody className="border border-orange-400">
            {filteredArticulos.map((a, index) => (
              <tr
                key={a.id_articulo}
                className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
              >
                <td className="px-4 py-2 border border-orange-400 text-gray-700">
                                   <img 
                    src={`http://localhost:3001/uploads/articulos/${a.imagen}`}
                    alt={a.modelo}
                    className="w-full h-full object-contain"
                  />
                </td>
                <td className="px-4 py-2 border border-orange-400 text-gray-700">
                  {a.modelo}
                </td>
                <td className="px-4 py-2 border border-orange-400 text-gray-700">
                  {a.descripcion}
                </td>

                <td className="px-4 py-2 text-center border border-orange-400 text-gray-700">
                  {a.pvp_sin_iva ? `${a.pvp_sin_iva} €` : "-"}
                </td>

                <td className="px-4 py-2 text-center border border-orange-400">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handlerClickView(a.id_articulo)}
                  >
                    Ver
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handlerClickDelete(a.id_articulo)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
};
