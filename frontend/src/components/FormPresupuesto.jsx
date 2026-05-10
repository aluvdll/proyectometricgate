import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "./NotificationModal";
import { UserSearch } from "./UserSearch";
import { obtenerArticulosEmpresa } from "../services/articulos";
import { obtenerClientesEmpresa } from "../services/clientes";
import {
  actualizarPresupuestoEmpresa,
  crearPresupuestoEmpresa,
  obtenerPresupuestoEmpresa,
} from "../services/presupuestos";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const estados = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviado" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
  { value: "invoiced", label: "Facturado" },
];

const hoy = new Date().toISOString().slice(0, 10);

function crearLinea() {
  return {
    standard_article_id: "",
    name: "",
    description: "",
    quantity: "1",
    unit_price: "0",
    discount_percentage: "0",
    tax_percentage: "21",
  };
}

function construirTextoCliente(cliente) {
  return [
    cliente.client_number,
    cliente.nombre,
    cliente.dni,
    cliente.telefono,
    cliente.direccion,
    cliente.poblacion,
    cliente.provincia,
  ]
    .filter(Boolean)
    .join(" - ");
}

function construirTextoArticulo(articulo) {
  return [
    articulo.code,
    articulo.name,
    articulo.family?.name,
    articulo.description,
  ]
    .filter(Boolean)
    .join(" - ");
}

function obtenerUrlImagenArticulo(articulo) {
  if (!articulo?.image) {
    return "";
  }

  return `${API_URL}/storage/${articulo.image}`;
}

export function FormPresupuesto({ mode, presupuestoId = undefined }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isClientAccordionOpen, setIsClientAccordionOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [budgetNumber, setBudgetNumber] = useState("");
  const [loadingForm, setLoadingForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");
  const [formData, setFormData] = useState({
    client_id: "",
    budget_date: hoy,
    status: "draft",
    notes: "",
  });
  const [lines, setLines] = useState([crearLinea()]);

  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 2500);
  };

  useEffect(() => {
    Promise.all([obtenerClientesEmpresa(), obtenerArticulosEmpresa()])
      .then(([clientesData, articulosData]) => {
        setClientes(clientesData);
        setArticulos(articulosData);
        return { clientesData, articulosData };
      })
      .then(async ({ clientesData, articulosData }) => {
        if (!isEdit || !presupuestoId) {
          return;
        }

        const presupuesto = await obtenerPresupuestoEmpresa(presupuestoId);
        setBudgetNumber(presupuesto.budget_number || "");
        setFormData({
          client_id: presupuesto.client_id?.toString() || "",
          budget_date: presupuesto.budget_date || hoy,
          status: presupuesto.status || "draft",
          notes: presupuesto.notes || "",
        });
        if (presupuesto.client) {
          setClientSearch(construirTextoCliente(presupuesto.client));
        }
        setLines(
          (presupuesto.lines || []).map((linea) => ({
            standard_article_id: linea.standard_article_id?.toString() || "",
            name: linea.name || "",
            description: linea.description || "",
            quantity: linea.quantity?.toString() || "1",
            unit_price: linea.unit_price?.toString() || "0",
            discount_percentage: linea.discount_percentage?.toString() || "0",
            tax_percentage: linea.tax_percentage?.toString() || "21",
          })) || [crearLinea()],
        );

        if (!clientesData.length) {
          setClientes([]);
        }
        if (!articulosData.length) {
          setArticulos([]);
        }
      })
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando datos del presupuesto",
          "error",
        );
      })
      .finally(() => setLoadingForm(false));
  }, [isEdit, presupuestoId]);

  useEffect(() => {
    if (!isClientModalOpen && !isArticleModalOpen) {
      return;
    }

    // Permite cerrar modales con la tecla Esc para una UX más rápida.
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsClientModalOpen(false);
        setIsArticleModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isClientModalOpen, isArticleModalOpen]);

  const clienteSeleccionado = useMemo(() => {
    return clientes.find(
      (cliente) => String(cliente.id) === String(formData.client_id),
    );
  }, [clientes, formData.client_id]);

  const clientesFiltrados = useMemo(() => {
    const texto = clientSearch.trim().toLowerCase();

    if (!texto) {
      return clientes.slice(0, 8);
    }

    return clientes
      .filter((cliente) =>
        construirTextoCliente(cliente).toLowerCase().includes(texto),
      )
      .slice(0, 8);
  }, [clientes, clientSearch]);

  const articulosFiltrados = useMemo(() => {
    const texto = articleSearch.trim().toLowerCase();

    if (!texto) {
      return articulos.slice(0, 20);
    }

    return articulos
      .filter((articulo) =>
        construirTextoArticulo(articulo).toLowerCase().includes(texto),
      )
      .slice(0, 20);
  }, [articulos, articleSearch]);

  const resumen = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const quantity = Number(line.quantity || 0);
        const unitPrice = Number(line.unit_price || 0);
        const discountPercentage = Number(line.discount_percentage || 0);
        const taxPercentage = Number(line.tax_percentage || 0);

        const grossSubtotal = quantity * unitPrice;
        const discountAmount = grossSubtotal * (discountPercentage / 100);
        const netSubtotal = grossSubtotal - discountAmount;
        const taxAmount = netSubtotal * (taxPercentage / 100);
        const totalAmount = netSubtotal + taxAmount;

        acc.base += netSubtotal;
        acc.tax += taxAmount;
        acc.total += totalAmount;
        return acc;
      },
      { base: 0, tax: 0, total: 0 },
    );
  }, [lines]);

  const actualizarLinea = (index, field, value) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const seleccionarArticuloEnLinea = (index, articulo) => {
    if (!articulo) {
      return;
    }

    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        standard_article_id: String(articulo.id),
        name: articulo.name || copy[index].name,
        description: articulo.description || "",
        unit_price: String(articulo.base_price ?? 0),
        tax_percentage: String(articulo.tax_percentage ?? 21),
      };
      return copy;
    });
  };

  const abrirModalArticulos = (lineIndex) => {
    setActiveLineIndex(lineIndex);

    const linea = lines[lineIndex];
    const articuloSeleccionado = articulos.find(
      (articulo) => String(articulo.id) === String(linea?.standard_article_id),
    );

    setArticleSearch(
      articuloSeleccionado ? construirTextoArticulo(articuloSeleccionado) : "",
    );
    setIsArticleModalOpen(true);
  };

  const cerrarModalArticulos = () => {
    setIsArticleModalOpen(false);
    setActiveLineIndex(null);
  };

  const seleccionarArticuloDesdeModal = (articulo) => {
    if (activeLineIndex === null) {
      return;
    }

    seleccionarArticuloEnLinea(activeLineIndex, articulo);
    cerrarModalArticulos();
  };

  const dejarLineaManualDesdeModal = () => {
    if (activeLineIndex === null) {
      return;
    }

    setLines((prev) => {
      const copy = [...prev];
      copy[activeLineIndex] = {
        ...copy[activeLineIndex],
        standard_article_id: "",
      };
      return copy;
    });

    cerrarModalArticulos();
  };

  const addLinea = () => {
    setLines((prev) => [...prev, crearLinea()]);
  };

  const removeLinea = (index) => {
    setLines((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  // Guardamos el id del cliente seleccionado y cerramos el modal.
  const seleccionarCliente = (cliente) => {
    setFormData((prev) => ({ ...prev, client_id: String(cliente.id) }));
    setClientSearch(construirTextoCliente(cliente));
    setIsClientAccordionOpen(false);
    setIsClientModalOpen(false);
  };

  const abrirModalClientes = () => {
    setClientSearch(
      clienteSeleccionado ? construirTextoCliente(clienteSeleccionado) : "",
    );
    setIsClientModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client_id) {
      showNotification("Error", "Debes seleccionar un cliente.", "error");
      return;
    }

    if (!lines.length) {
      showNotification("Error", "Debes añadir al menos una línea.", "error");
      return;
    }

    const payload = {
      client_id: Number(formData.client_id),
      budget_date: formData.budget_date,
      status: formData.status,
      notes: formData.notes,
      lines: lines.map((line, index) => ({
        standard_article_id: line.standard_article_id
          ? Number(line.standard_article_id)
          : null,
        name: line.name,
        description: line.description,
        quantity: Number(line.quantity || 0),
        unit_price: Number(line.unit_price || 0),
        discount_percentage: Number(line.discount_percentage || 0),
        tax_percentage: Number(line.tax_percentage || 21),
        position: index,
      })),
    };

    setSaving(true);
    try {
      if (isEdit && presupuestoId) {
        await actualizarPresupuestoEmpresa(presupuestoId, payload);
        showNotification("Éxito", "Presupuesto actualizado", "success");
      } else {
        await crearPresupuestoEmpresa(payload);
        showNotification("Éxito", "Presupuesto creado", "success");
      }

      setTimeout(() => navigate("/adminPanel/presupuestos"), 2500);
    } catch (error) {
      const mensaje = error?.fieldErrors
        ? Object.values(error.fieldErrors).flat().join("\n")
        : error.message || "Error al guardar presupuesto";
      showNotification("Error", mensaje, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingForm) {
    return <div className="container w-full mt-1">Cargando presupuesto...</div>;
  }

  return (
    <div className="container w-full mt-1">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto rounded-md border border-orange-500 p-8 shadow-md"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
        </h2>

        {isEdit && budgetNumber && (
          <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            Número de presupuesto: <strong>{budgetNumber}</strong>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
              Cliente
            </label>
            <button
              type="button"
              onClick={abrirModalClientes}
              className="w-full rounded-md border border-orange-500 bg-white px-3 py-2 text-left text-sm text-gray-900 hover:bg-orange-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {/* Cuando ya hay cliente, mostramos solo el código para que sea compacto. */}
              {clienteSeleccionado
                ? clienteSeleccionado.client_number
                : "Buscar y seleccionar cliente"}
            </button>

            {!formData.client_id && (
              <p className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                Debes seleccionar un cliente para guardar el presupuesto.
              </p>
            )}

            {clienteSeleccionado && (
              <div className="mt-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-500/60 dark:bg-orange-900/20">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="w-full md:max-w-md">
                    <label className="mb-1 block text-xs font-semibold text-orange-800 dark:text-orange-200">
                      Nombre del cliente
                    </label>
                    {/* Campo informativo: nombre del cliente seleccionado (solo lectura). */}
                    <input
                      type="text"
                      readOnly
                      value={clienteSeleccionado.nombre || ""}
                      className="w-full rounded-md border border-orange-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-orange-500/60 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="md:self-end">
                    {/* Acordeón para mostrar/ocultar datos extra del cliente. */}
                    <button
                      type="button"
                      onClick={() => setIsClientAccordionOpen((prev) => !prev)}
                      className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                    >
                      {isClientAccordionOpen ? "Ocultar datos" : "Ver datos"}
                    </button>
                  </div>
                </div>

                {isClientAccordionOpen && (
                  <div className="mt-3 grid gap-2 border-t border-orange-200 pt-3 text-xs text-gray-700 dark:border-orange-500/40 dark:text-gray-100 md:grid-cols-2">
                    <div>
                      <span className="font-semibold">DNI:</span>{" "}
                      {clienteSeleccionado.dni || "Sin DNI"}
                    </div>
                    <div>
                      <span className="font-semibold">Telefono:</span>{" "}
                      {clienteSeleccionado.telefono || "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Direccion:</span>{" "}
                      {clienteSeleccionado.direccion || "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Poblacion:</span>{" "}
                      {clienteSeleccionado.poblacion || "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Provincia:</span>{" "}
                      {clienteSeleccionado.provincia || "-"}
                    </div>
                    <div>
                      <span className="font-semibold">Codigo Postal:</span>{" "}
                      {clienteSeleccionado.codigo_postal || "-"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Fecha</label>
            <input
              type="date"
              name="budget_date"
              value={formData.budget_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget_date: e.target.value,
                }))
              }
              className="w-full rounded-md border border-orange-500 px-3 py-2"
            />

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-md border border-orange-500 bg-white px-3 py-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              >
                {estados.map((estado) => (
                  <option
                    key={estado.value}
                    value={estado.value}
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isClientModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 px-3"
            onClick={() => setIsClientModalOpen(false)}
          >
            <div
              className="w-full max-w-3xl rounded-lg border border-orange-300 bg-white shadow-xl dark:border-orange-500 dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Click fuera del cuadro: cierra modal. Click dentro: no cierra. */}
              <div className="flex items-center justify-between border-b border-orange-200 px-4 py-3 dark:border-orange-500/60">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  Seleccionar cliente
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="p-4">
                {/* Buscador superior estilo panel de clientes. */}
                <div className="mb-3 w-full">
                  <UserSearch value={clientSearch} onChange={setClientSearch} />
                </div>

                <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
                  {clientesFiltrados.map((cliente) => {
                    const seleccionado =
                      String(cliente.id) === String(formData.client_id);

                    return (
                      <article
                        key={cliente.id}
                        className={`rounded-lg border px-3 py-2 shadow-sm ${
                          seleccionado
                            ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20"
                            : "border-orange-200 bg-white dark:border-orange-500/40 dark:bg-gray-800"
                        }`}
                      >
                        <div className="grid gap-2 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                          <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                            Cod. {cliente.client_number}
                          </span>

                          <div>
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {cliente.nombre}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {cliente.dni || "Sin DNI"} |{" "}
                              {cliente.telefono || "Sin teléfono"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => seleccionarCliente(cliente)}
                            className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Seleccionar
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {!clientesFiltrados.length && (
                    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-4 text-center text-sm text-orange-800 dark:border-orange-500/60 dark:bg-orange-900/20 dark:text-orange-100">
                      No hay clientes que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isArticleModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 px-3"
            onClick={cerrarModalArticulos}
          >
            <div
              className="w-full max-w-4xl rounded-lg border border-orange-300 bg-white shadow-xl dark:border-orange-500 dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal de artículos: buscar, visualizar imagen y seleccionar en la línea activa. */}
              <div className="flex items-center justify-between border-b border-orange-200 px-4 py-3 dark:border-orange-500/60">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  Seleccionar artículo
                </h3>
                <button
                  type="button"
                  onClick={cerrarModalArticulos}
                  className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="p-4">
                <div className="mb-3 w-full">
                  <UserSearch
                    value={articleSearch}
                    onChange={setArticleSearch}
                  />
                </div>

                <div className="mb-3">
                  <button
                    type="button"
                    onClick={dejarLineaManualDesdeModal}
                    className="rounded-md bg-gray-500 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Usar línea manual
                  </button>
                </div>

                <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
                  {articulosFiltrados.map((articulo) => (
                    <article
                      key={articulo.id}
                      className="rounded-lg border border-orange-200 bg-white px-3 py-2 shadow-sm dark:border-orange-500/40 dark:bg-gray-800"
                    >
                      <div className="grid gap-3 md:grid-cols-[64px_minmax(0,1fr)_auto] md:items-center">
                        <div className="h-16 w-16 overflow-hidden rounded border border-orange-200 bg-gray-100 dark:border-orange-500/40 dark:bg-gray-700">
                          {articulo.image ? (
                            <img
                              src={obtenerUrlImagenArticulo(articulo)}
                              alt={articulo.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-600 dark:text-gray-300">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {articulo.code} - {articulo.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {articulo.family?.name || "Sin familia"} | Base:{" "}
                            {Number(articulo.base_price || 0).toFixed(2)} EUR |
                            IVA:{" "}
                            {Number(articulo.tax_percentage || 0).toFixed(2)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {articulo.description || "Sin descripción"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            seleccionarArticuloDesdeModal(articulo)
                          }
                          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </article>
                  ))}

                  {!articulosFiltrados.length && (
                    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-4 text-center text-sm text-orange-800 dark:border-orange-500/60 dark:bg-orange-900/20 dark:text-orange-100">
                      No hay artículos que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold">Observaciones</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-100">
            Líneas
          </h3>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div
              key={index}
              className="rounded-md border border-orange-300 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-gray-700">
                  Línea {index + 1}
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLinea(index)}
                    className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="mb-2 block text-sm font-bold">
                  Artículo estándar
                </label>
                {/* El artículo ahora se selecciona desde modal con buscador para facilitar la elección. */}
                <button
                  type="button"
                  onClick={() => abrirModalArticulos(index)}
                  className="w-full rounded-md border border-orange-500 bg-white px-3 py-2 text-left text-sm text-gray-900 hover:bg-orange-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  {line.standard_article_id
                    ? `Artículo seleccionado: ${line.name || "Sin nombre"}`
                    : "Buscar y seleccionar artículo"}
                </button>

                {line.standard_article_id && (
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-gray-700 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-gray-100">
                    {(() => {
                      const articuloLinea = articulos.find(
                        (articulo) =>
                          String(articulo.id) ===
                          String(line.standard_article_id),
                      );

                      return (
                        <>
                          {articuloLinea?.image ? (
                            <img
                              src={obtenerUrlImagenArticulo(articuloLinea)}
                              alt={articuloLinea.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              Sin imagen
                            </div>
                          )}

                          <div>
                            <div className="font-semibold">
                              Código: {articuloLinea?.code || "Sin código"}
                            </div>
                            <div>
                              Nombre:{" "}
                              {articuloLinea?.name || line.name || "Sin nombre"}
                            </div>
                            <div>
                              Familia:{" "}
                              {articuloLinea?.family?.name || "Sin familia"}
                            </div>
                            <div>
                              Descripción:{" "}
                              {articuloLinea?.description ||
                                line.description ||
                                "Sin descripción"}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {!line.standard_article_id && (
                <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Estos campos solo se usan cuando la línea es manual (sin artículo seleccionado). */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={line.name}
                      onChange={(e) =>
                        actualizarLinea(index, "name", e.target.value)
                      }
                      className="w-full rounded-md border border-orange-500 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) =>
                        actualizarLinea(index, "description", e.target.value)
                      }
                      className="w-full rounded-md border border-orange-500 px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) =>
                      actualizarLinea(index, "quantity", e.target.value)
                    }
                    className="w-full rounded-md border border-orange-500 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Precio unitario
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) =>
                      actualizarLinea(index, "unit_price", e.target.value)
                    }
                    className="w-full rounded-md border border-orange-500 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Descuento %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={line.discount_percentage}
                    onChange={(e) =>
                      actualizarLinea(
                        index,
                        "discount_percentage",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-md border border-orange-500 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">IVA %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={line.tax_percentage}
                    onChange={(e) =>
                      actualizarLinea(index, "tax_percentage", e.target.value)
                    }
                    className="w-full rounded-md border border-orange-500 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={addLinea}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Añadir línea
          </button>
        </div>

        <div className="mt-6 rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-gray-800">
          <div>
            Base imponible: <strong>{resumen.base.toFixed(2)} €</strong>
          </div>
          <div>
            IVA: <strong>{resumen.tax.toFixed(2)} €</strong>
          </div>
          <div>
            Total: <strong>{resumen.total.toFixed(2)} €</strong>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-md bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear presupuesto"}
        </button>
      </form>

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

export default FormPresupuesto;
