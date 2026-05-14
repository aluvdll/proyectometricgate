import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPedidos } from "../services/pedidos";

export function PedidosPanel() {
  const navigate = useNavigate();

  // Estado: arreglo de pedidos
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtro por estado
  const [estadoFiltro, setEstadoFiltro] = useState(null); // null = todos

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CARGAR PEDIDOS AL ABRIR PANEL                                  ║
  // ╚════════════════════════════════════════════════════════════════╝

  useEffect(() => {
    cargarPedidos();
  }, []);

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CARGAR PEDIDOS DEL SERVIDOR                                    ║
  // ╚════════════════════════════════════════════════════════════════╝

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      // Llamar servicio con estado filtro (null = todos)
      const datos = await listarPedidos(estadoFiltro);
      setPedidos(datos);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  // Recargar pedidos cuando cambia el filtro
  useEffect(() => {
    cargarPedidos();
  }, [estadoFiltro]);

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ FUNCIONES AUXILIARES                                           ║
  // ╚════════════════════════════════════════════════════════════════╝

  // Obtener color según estado
  const getColorEstado = (estado) => {
    if (estado === "pendiente") return "bg-yellow-100 text-yellow-800";
    if (estado === "en_curso") return "bg-blue-100 text-blue-800";
    if (estado === "finalizado") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  // Obtener etiqueta legible del estado
  const getEtiquetaEstado = (estado) => {
    if (estado === "pendiente") return "Pendiente";
    if (estado === "en_curso") return "En curso";
    if (estado === "finalizado") return "Finalizado";
    return estado;
  };

  // Ir al detalle del pedido
  const irAlDetalle = (id) => {
    navigate(`/adminPanel/pedidos/${id}`);
  };

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ RENDER                                                         ║
  // ╚════════════════════════════════════════════════════════════════╝

  return (
    <div className="space-y-6 p-6">
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Pedidos</h1>
      </div>

      {/* FILTROS POR ESTADO */}
      <div className="flex flex-wrap gap-3">
        {/* Botón "Todos" */}
        <button
          onClick={() => setEstadoFiltro(null)}
          className={`rounded-lg px-4 py-2 font-semibold transition ${
            estadoFiltro === null
              ? "bg-blue-600 text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          }`}
        >
          Todos ({pedidos.length})
        </button>

        {/* Botón "Pendientes" */}
        <button
          onClick={() => setEstadoFiltro("pendiente")}
          className={`rounded-lg px-4 py-2 font-semibold transition ${
            estadoFiltro === "pendiente"
              ? "bg-yellow-600 text-white"
              : "border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-100"
          }`}
        >
          Pendientes
        </button>

        {/* Botón "En curso" */}
        <button
          onClick={() => setEstadoFiltro("en_curso")}
          className={`rounded-lg px-4 py-2 font-semibold transition ${
            estadoFiltro === "en_curso"
              ? "bg-blue-600 text-white"
              : "border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100"
          }`}
        >
          En curso
        </button>

        {/* Botón "Finalizados" */}
        <button
          onClick={() => setEstadoFiltro("finalizado")}
          className={`rounded-lg px-4 py-2 font-semibold transition ${
            estadoFiltro === "finalizado"
              ? "bg-green-600 text-white"
              : "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900 dark:text-green-100"
          }`}
        >
          Finalizados
        </button>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Número
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Cliente
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Fecha
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Estado
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                Total
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              // Mostrar cargando
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Cargando pedidos...
                </td>
              </tr>
            ) : pedidos.length === 0 ? (
              // Mostrar "sin resultados"
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay pedidos
                </td>
              </tr>
            ) : (
              // Mostrar pedidos
              pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="border-b transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 font-semibold dark:text-gray-300">
                    {pedido.order_number}
                  </td>
                  <td className="px-6 py-4 dark:text-gray-300">
                    {pedido.client?.nombre || "Sin cliente"}
                  </td>
                  <td className="px-6 py-4 dark:text-gray-300">
                    {new Date(pedido.order_date).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getColorEstado(pedido.status)}`}
                    >
                      {getEtiquetaEstado(pedido.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold dark:text-gray-300">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(pedido.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => irAlDetalle(pedido.id)}
                      className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
