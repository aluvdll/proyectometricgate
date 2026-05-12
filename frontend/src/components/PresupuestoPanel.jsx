import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "./NotificationModal";
import { UserSearch } from "./UserSearch";
import { obtenerPresupuestosEmpresa } from "../services/presupuestos";

const estadosTexto = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
  invoiced: "Facturado",
};

export function PresupuestosPanel() {
  const navigate = useNavigate();
  const [presupuestos, setPresupuestos] = useState([]);
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
    obtenerPresupuestosEmpresa()
      .then((data) => setPresupuestos(data))
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando presupuestos",
          "error",
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const presupuestosFiltrados = useMemo(() => {
    if (!textoBusqueda.trim()) return presupuestos;

    const filtro = textoBusqueda.toLowerCase();
    return presupuestos.filter((presupuesto) => {
      const fuente = [
        presupuesto.budget_number,
        presupuesto.client?.nombre,
        presupuesto.status,
        presupuesto.budget_date,
        presupuesto.total_amount,
      ]
        .join(" ")
        .toLowerCase();

      return fuente.includes(filtro);
    });
  }, [presupuestos, textoBusqueda]);

  if (cargando) {
    return (
      <div className="container w-full mt-1">Cargando presupuestos...</div>
    );
  }

  return (
    <div className="container w-full mt-1">
      <div className="w-full mx-auto rounded-md border border-orange-400 p-4 shadow-amber-600">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
            Presupuestos
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-64">
              <UserSearch value={textoBusqueda} onChange={setTextoBusqueda} />
            </div>
            <button
              type="button"
              onClick={() =>
                navigate("/adminPanel/presupuestos/nuevopresupuesto")
              }
              className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Nuevo presupuesto
            </button>
          </div>
        </div>

        <table className="min-w-full rounded-md border border-orange-400">
          <thead className="border border-orange-400 bg-orange-500">
            <tr>
              <th className="px-3 py-2 text-left text-gray-800">Número</th>
              <th className="px-3 py-2 text-left text-gray-800">Cliente</th>
              <th className="px-3 py-2 text-left text-gray-800">Fecha</th>
              <th className="px-3 py-2 text-center text-gray-800">Estado</th>
              <th className="px-3 py-2 text-center text-gray-800">Total</th>
              <th className="px-3 py-2 text-center text-gray-800">Acciones</th>
            </tr>
          </thead>
          <tbody className="border border-orange-400">
            {presupuestosFiltrados.map((presupuesto, index) => (
              <tr
                key={presupuesto.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-orange-50"} border border-orange-400`}
              >
                <td className="border border-orange-400 px-3 py-2 text-gray-700">
                  {presupuesto.budget_number}
                </td>
                <td className="border border-orange-400 px-3 py-2 text-gray-700">
                  {presupuesto.client?.nombre || "Cliente eliminado"}
                </td>
                <td className="border border-orange-400 px-3 py-2 text-gray-700">
                  {presupuesto.budget_date}
                </td>
                <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                  {estadosTexto[presupuesto.status] || presupuesto.status}
                </td>
                <td className="border border-orange-400 px-3 py-2 text-center text-gray-700">
                  {Number(presupuesto.total_amount).toFixed(2)} €
                </td>
                <td className="border border-orange-400 px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/adminPanel/presupuestos/vereditarpresupuesto/${presupuesto.id}`,
                        )
                      }
                      className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `/adminPanel/presupuestos/imprimir/${presupuesto.id}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="rounded-md bg-gray-700 px-3 py-1 text-white hover:bg-gray-800"
                    >
                      Imprimir
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {presupuestosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-600">
                  No hay presupuestos para mostrar
                </td>
              </tr>
            )}
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
}

export default PresupuestosPanel;
