import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "../../components/modals/NotificationModal";
import { UserSearch } from "../../components/shared/UserSearch.jsx";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const UsersPanel = () => {
  const { token, user, loading: authLoading } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setError("No autorizado");
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get("http://127.0.0.1:8000/api/company/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("DATA:", response.data);
        setUsuarios(response.data);
      })
      .catch(() => {
        setError(null);
        setNotifyTitle("Error");
        setNotifyMessage("No hay conexión con el servidor.");
        setNotifyType("error");
        setNotifyVisible(true);
        setTimeout(() => setNotifyVisible(false), 3000);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, authLoading]);

  const handlerClickEdit = (id) => {
    navigate(`/adminPanel/usuarios/vereditarusuario/${id}`);
  };

  const handlerClickDelete = async (id) => {
    if (!token) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/company/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));

      setNotifyTitle("Éxito");
      setNotifyMessage("Usuario eliminado correctamente");
      setNotifyType("success");
      setNotifyVisible(true);
      setTimeout(() => setNotifyVisible(false), 3000);
    } catch (error) {
      let message = "Error inesperado";
      if (axios.isAxiosError(error)) message = error.message;

      setNotifyTitle("Error");
      setNotifyMessage(message);
      setNotifyType("error");
      setNotifyVisible(true);

      setTimeout(() => setNotifyVisible(false), 3000);
    }
  };

  if (authLoading) return <div>Cargando sesión...</div>;
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const filteredUsuarios = usuarios.filter((usuario) =>
    Object.values(usuario)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  console.log("SEARCH:", search);
  console.log("FILTERED:", filteredUsuarios);

  return (
    <div className="container w-full mt-1">
      <div className="mt-1 w-full mx-auto p-4 rounded-md shadow-amber-600 border border-orange-400">
        <div className="flex-row mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-200">
            Usuarios
          </h2>

          <div className="flex justify-end mb-3">
            <div className="w-64">
              <UserSearch value={search} onChange={setSearch} />
            </div>
          </div>
        </div>

        <table className="min-w-full rounded-md border border-orange-400">
          <thead className="bg-orange-400 border border-orange-400">
            <tr>
              <th className="px-4 py-1 text-left text-gray-700">Avatar</th>
              <th className="px-4 py-1 text-left text-gray-700">Nombre</th>
              <th className="px-4 py-1 text-left text-gray-700">Correo</th>
              <th className="px-4 py-1 text-left text-gray-700">Rol</th>
              <th className="px-4 py-1 text-center text-gray-700">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsuarios
              .filter((usuario) => usuario.id !== user?.id)
              .map((usuario, index) => (
                <tr
                  key={usuario.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-orange-50"
                  } border border-orange-400`}
                >
                  <td className="px-4 py-2">
                    <img
                      src={
                        usuario.avatar
                          ? `${API_URL}/storage/${usuario.avatar}`
                          : "/ico_avatar_default.png"
                      }
                      alt="Avatar"
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-300"
                    />
                  </td>

                  <td className="px-4 py-2 text-gray-700 dark:text-gray-900">
                    {usuario.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-900">
                    {usuario.email}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-900">
                    {usuario.role}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                        onClick={() => handlerClickEdit(usuario.id)}
                      >
                        Editar
                      </button>

                      <button
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                        onClick={() => handlerClickDelete(usuario.id)}
                      >
                        Eliminar
                      </button>
                    </div>
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
