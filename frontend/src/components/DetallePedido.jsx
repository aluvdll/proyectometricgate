import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPedido, actualizarEstadoPedido } from "../services/pedidos";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

//obtener empresa
export async function obtenerEmpresa() {
  const res = await axios.get(`${API_URL}/api/me`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  // El backend devuelve el usuario; si incluye la relación company la usamos
  return res.data.company;
}

export function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado del pedido
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  // Modales
  const [mostrarCambioEstado, setMostrarCambioEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CARGAR PEDIDO AL ABRIR                                         ║
  // ╚════════════════════════════════════════════════════════════════╝

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      setCargando(true);
      const datos = await obtenerPedido(id);
      setPedido(datos);
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    } finally {
      setCargando(false);
    }
  };

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CAMBIAR ESTADO DEL PEDIDO                                      ║
  // ╚════════════════════════════════════════════════════════════════╝

  const cambiarEstado = async () => {
    try {
      setActualizando(true);
      await actualizarEstadoPedido(id, nuevoEstado);
      await cargarPedido(); // Recargar para ver cambios
      setMostrarCambioEstado(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setActualizando(false);
    }
  };

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ GENERAR PDF MATRÍCULA                                          ║
  // ║ Solo disponible si pedido está finalizado                      ║
  // ║ Logo + Número de matrícula + Medidas de fabricación            ║
  // ╚════════════════════════════════════════════════════════════════╝

  const generarMatricula = async () => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Crear HTML del PDF
      const element = document.createElement("div");
      element.style.width = "105mm";
      element.style.height = "148mm";
      element.style.padding = "8mm";
      element.style.boxSizing = "border-box";
      element.style.fontFamily = "Arial, sans-serif";
      element.style.backgroundColor = "#ffffff";
      element.style.display = "flex";
      element.style.flexDirection = "column";
      element.style.alignItems = "center";
      element.style.justifyContent = "flex-start";
      element.style.gap = "0";
      element.style.overflow = "hidden";

      // Logo
      const logo = document.createElement("img");
      logo.src = "/logo_MetricGate.png";
      logo.style.display = "block";
      logo.style.maxWidth = "65mm";
      logo.style.width = "100%";
      logo.style.margin = "0 auto 4mm auto";
      logo.onerror = () => {
        logo.style.display = "none";
      };

      // Número de matrícula
      const numeroMatricula = document.createElement("div");
      numeroMatricula.style.textAlign = "center";
      numeroMatricula.style.width = "100%";
      numeroMatricula.style.marginBottom = "0";
      numeroMatricula.innerHTML = `
        <p style="font-size: 8px; color: #666; margin: 0 0 3mm 0;">MATRÍCULA</p>
        <h1 style="font-size: 24px; font-weight: bold; color: #000; margin: 0; letter-spacing: 1px; line-height: 1.05;">
          ${pedido.order_number}
        </h1>
      `;

      // Datos de la empresa
      const empresa = await obtenerEmpresa();
      const datosEmpresa = document.createElement("div");
      datosEmpresa.style.textAlign = "center";
      datosEmpresa.innerHTML = `
        <p style="font-size: 14px; font-weight: bold; color: #000; margin: 6mm 0 2mm 0;">
          ${empresa.fiscal_name}
        </p>
        <p style="font-size: 9px; color: #666; margin: 0 0 1mm 0;">
          ${empresa.address} 
        </p>
        
        <p style="font-size: 9px; color: #666; margin: 0 0 1mm 0;">
         ${empresa.city} · ${empresa.postal_code} · 
        </p>
        
        <p style="font-size: 9px; color: #666; margin: 0 0 1mm 0;">
          ${empresa.province}
        </p>
        
        <p style="font-size: 9px; color: #666; margin: 0;">
          CIF: ${empresa.cif_nif} · Tel: ${empresa.phone}
        </p>
      `;

      element.appendChild(logo);
      element.appendChild(numeroMatricula);
      element.appendChild(datosEmpresa);

      // Opciones de html2pdf
      const options = {
        margin: 0,
        filename: `matricula_${pedido.order_number}.pdf`,
        image: { type: "image/png", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a6", orientation: "portrait" },
      };

      // Generar PDF
      html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar la matrícula");
    }
  };

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ FUNCIONES AUXILIARES                                           ║
  // ╚════════════════════════════════════════════════════════════════╝

  const getColorEstado = (estado) => {
    if (estado === "pendiente") return "bg-yellow-100 text-yellow-800";
    if (estado === "en_curso") return "bg-blue-100 text-blue-800";
    if (estado === "finalizado") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getEtiquetaEstado = (estado) => {
    if (estado === "pendiente") return "Pendiente";
    if (estado === "en_curso") return "En curso";
    if (estado === "finalizado") return "Finalizado";
    return estado;
  };

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ RENDER CARGANDO                                                ║
  // ╚════════════════════════════════════════════════════════════════╝

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500 dark:text-gray-400">
          Cargando pedido...
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
          Pedido no encontrado
        </div>
      </div>
    );
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ RENDER DETALLE                                                 ║
  // ╚════════════════════════════════════════════════════════════════╝

  return (
    <div className="space-y-6 p-6">
      {/* ENCABEZADO */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">
            Pedido {pedido.order_number}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cliente: {pedido.client?.nombre || "Sin cliente"}
          </p>
        </div>
        <button
          onClick={() => navigate("/adminPanel/pedidos")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          Volver
        </button>
      </div>

      {/* INFORMACIÓN DEL PEDIDO */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Número */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Número
          </p>
          <p className="mt-1 text-lg font-bold dark:text-white">
            {pedido.order_number}
          </p>
        </div>

        {/* Fecha */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Fecha
          </p>
          <p className="mt-1 text-lg font-bold dark:text-white">
            {new Date(pedido.order_date).toLocaleDateString("es-ES")}
          </p>
        </div>

        {/* Estado */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Estado
          </p>
          <div className="mt-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getColorEstado(pedido.status)}`}
            >
              {getEtiquetaEstado(pedido.status)}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Total
          </p>
          <p className="mt-1 text-lg font-bold dark:text-white">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(pedido.total_amount)}
          </p>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-3">
        {/* Botón cambiar estado */}
        {pedido.status !== "finalizado" && (
          <button
            onClick={() => setMostrarCambioEstado(true)}
            disabled={pedido.status === "finalizado"}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Cambiar estado
          </button>
        )}
        {/* Botón generar matrícula (solo si finalizado) */}
        {pedido.status === "finalizado" && (
          <button
            onClick={generarMatricula}
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Generar matrícula (PDF)
          </button>
        )}
      </div>

      {/* TABLA DE ARTÍCULOS */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 px-6 py-3 dark:bg-gray-800">
          <h2 className="text-lg font-bold dark:text-white">Artículos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Precio
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {pedido.lines?.map((linea, idx) => (
                <tr
                  key={idx}
                  className="border-b transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 dark:text-gray-300">
                    <div className="font-semibold">{linea.name}</div>
                    {linea.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {linea.description}
                      </div>
                    )}

                    {/* Si es configurable, mostrar medidas de fabricación */}
                    {(linea.article_type === "configurable" ||
                      linea.configurable_article_id != null) &&
                      linea.configuration &&
                      Number(linea.configuration.ancho_hueco) > 0 &&
                      (() => {
                        const C = Number(linea.configuration.ancho_hueco);
                        const D = Number(linea.configuration.alto_hueco) || 0;

                        // Usar medidas guardadas si tienen valores válidos; si no, recalcular
                        const savedMedidas =
                          linea.configuration.fabrication_measures;
                        const todasValidas =
                          Array.isArray(savedMedidas) &&
                          savedMedidas.length > 0 &&
                          savedMedidas.every((m) => m.label && m.valor != null);

                        const medidas = todasValidas
                          ? savedMedidas
                          : [
                              {
                                label: "Ancho cristal de fijos laterales",
                                formula: "(C/4) + 45",
                                valor: Number((C / 4 + 45).toFixed(2)),
                              },
                              {
                                label: "Alto cristal de los fijos laterales",
                                formula: "D",
                                valor: Number(D.toFixed(2)),
                              },
                              {
                                label: "Ancho cristal de las hojas móviles",
                                formula: "(C/4) - 5",
                                valor: Number((C / 4 - 5).toFixed(2)),
                              },
                              {
                                label:
                                  "Alto cristal de las hojas móviles (sin perfil plintón)",
                                formula: "D - 50",
                                valor: Number((D - 50).toFixed(2)),
                              },
                              {
                                label: "Ancho hueco de paso libre final",
                                formula: "C - ((C/4) + 45) × 2",
                                valor: Number(
                                  (C - (C / 4 + 45) * 2).toFixed(2),
                                ),
                              },
                              {
                                label: "Alto hueco de paso libre",
                                formula: "D",
                                valor: Number(D.toFixed(2)),
                              },
                            ];

                        return (
                          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs dark:bg-blue-950">
                            <p className="mb-2 font-bold text-blue-700 dark:text-blue-300">
                              Medidas de fabricación
                            </p>
                            <p className="mb-2 text-blue-500 dark:text-blue-400">
                              C (ancho hueco) = {C} mm · D (alto hueco) = {D} mm
                            </p>
                            <table className="w-full border-collapse">
                              <tbody>
                                {medidas.map((m, i) => (
                                  <tr
                                    key={i}
                                    className={
                                      i % 2 === 0
                                        ? "bg-blue-100 dark:bg-blue-900"
                                        : ""
                                    }
                                  >
                                    <td className="py-1 pr-3 text-blue-800 dark:text-blue-200">
                                      {m.label}
                                      <span className="ml-1 text-blue-400 dark:text-blue-500">
                                        ({m.formula})
                                      </span>
                                    </td>
                                    <td className="py-1 text-right font-bold text-blue-900 dark:text-blue-100 whitespace-nowrap">
                                      {m.valor} mm
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                  </td>
                  <td className="px-6 py-4 text-right dark:text-gray-300">
                    {Number(linea.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right dark:text-gray-300">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(linea.unit_price)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold dark:text-gray-300">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(linea.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CAMBIAR ESTADO */}
      {mostrarCambioEstado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="text-lg font-bold dark:text-white">
              Cambiar estado
            </h3>

            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
              <option value="finalizado">Finalizado</option>
            </select>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMostrarCambioEstado(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarEstado}
                disabled={!nuevoEstado || actualizando}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actualizando ? "Actualizando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
