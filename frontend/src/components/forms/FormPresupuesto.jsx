import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationModal } from "../modals/NotificationModal";
import { UserSearch } from "../shared/UserSearch.jsx";
import { obtenerArticulosEmpresa } from "../../services/articulos";
import { obtenerClientesEmpresa } from "../../services/clientes";
import { listarArticulosConfigurables } from "../../services/articulosConfigurables";
import {
  actualizarPresupuestoEmpresa,
  crearPresupuestoEmpresa,
  obtenerPresupuestoEmpresa,
} from "../../services/presupuestos";

import { API_URL } from "../../services/apiBase";

const estados = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aceptado", label: "Aceptado" },
];

const hoy = new Date().toISOString().slice(0, 10);

// Aqui convierto fecha ISO (YYYY-MM-DD) a formato visible DD/MM/AAAA.
function formatearFechaPresupuesto(fecha) {
  if (!fecha) return "-";

  const [anio, mes, dia] = String(fecha).split("-");
  if (!anio || !mes || !dia) return String(fecha);

  return `${dia}/${mes}/${anio}`;
}

// Aqui creo la estructura base de una linea nueva del presupuesto.
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

// Aqui construyo el texto que uso para buscar y mostrar clientes en el modal.
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

// Aqui construyo el texto que uso para buscar y mostrar articulos en el modal.
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

// Aqui preparo la URL absoluta de la imagen del articulo para mostrar miniatura.
function obtenerUrlImagenArticulo(articulo) {
  if (!articulo?.image) {
    return "";
  }

  return `${API_URL}/storage/${articulo.image}`;
}

export function FormPresupuesto({ mode, presupuestoId = undefined }) {
  // Aqui preparo utilidades de navegacion y deteccion de modo edicion.
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = mode === "edit";

  // Aqui guardo todos los estados del formulario, modales y notificaciones.
  const [clientes, setClientes] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [articulosConfigurables, setArticulosConfigurables] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isClientAccordionOpen, setIsClientAccordionOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isConfigListModalOpen, setIsConfigListModalOpen] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [configSearch, setConfigSearch] = useState("");
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
    status: "pendiente",
    notes: "",
  });
  const [lines, setLines] = useState([crearLinea()]);

  // Aqui muestro notificaciones unificadas de exito/error para el usuario.
  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 2500);
  };

  // Aqui cargo datos base (clientes, articulos y configurables) y, si edito, hidrato el presupuesto.
  useEffect(() => {
    Promise.all([
      obtenerClientesEmpresa(),
      obtenerArticulosEmpresa(),
      listarArticulosConfigurables(),
    ])
      .then(([clientesData, articulosData, articulosConfigData]) => {
        setClientes(clientesData);
        setArticulos(articulosData);
        setArticulosConfigurables(articulosConfigData);
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
          status: presupuesto.status || "pendiente",
          notes: presupuesto.notes || "",
        });
        if (presupuesto.client) {
          setClientSearch(construirTextoCliente(presupuesto.client));
        }
        setLines(
          (presupuesto.lines || []).map((linea) => {
            const baseLine = {
              standard_article_id: linea.standard_article_id?.toString() || "",
              name: linea.name || "",
              description: linea.description || "",
              quantity: linea.quantity?.toString() || "1",
              unit_price: linea.unit_price?.toString() || "0",
              discount_percentage: linea.discount_percentage?.toString() || "0",
              tax_percentage: linea.tax_percentage?.toString() || "21",
            };

            if (linea.configurable_article_id && linea.configuration) {
              baseLine._isConfigurable = true;
              baseLine._configurable_article_id = linea.configurable_article_id;
              baseLine._configuration = {
                ancho_hueco: linea.configuration.ancho_hueco,
                alto_hueco: linea.configuration.alto_hueco,
                ancho_obra: linea.configuration.ancho_obra,
                alto_obra: linea.configuration.alto_obra,
                paso_deseado: linea.configuration.paso_deseado,
                options_chosen: linea.configuration.options_chosen || {},
                price_breakdown: linea.configuration.price_breakdown || [],
                fabrication_measures:
                  linea.configuration.fabrication_measures || [],
              };
            }

            return baseLine;
          }) || [crearLinea()],
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

  // Aqui escucho la tecla ESC para cerrar modales de forma rapida.
  useEffect(() => {
    if (!isClientModalOpen && !isArticleModalOpen && !isConfigListModalOpen) {
      return;
    }

    // Permite cerrar modales con la tecla Esc para una experiencia más rápida.
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsClientModalOpen(false);
        setIsArticleModalOpen(false);
        setIsConfigListModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isClientModalOpen, isArticleModalOpen, isConfigListModalOpen]);

  // Aqui localizo el cliente seleccionado a partir del id guardado en el formulario.
  const clienteSeleccionado = useMemo(() => {
    return clientes.find(
      (cliente) => String(cliente.id) === String(formData.client_id),
    );
  }, [clientes, formData.client_id]);

  // Aqui filtro clientes para el modal y limito resultados para mantenerlo agil.
  const clientesFiltrados = useMemo(() => {
    const texto = clientSearch.trim().toLowerCase();

    if (!texto) {
      return clientes.slice(0, 10);
    }

    return clientes
      .filter((cliente) =>
        construirTextoCliente(cliente).toLowerCase().includes(texto),
      )
      .slice(0, 10);
  }, [clientes, clientSearch]);

  // Aqui filtro articulos estandar para el modal con buscador.
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

  // Aqui filtro articulos configurables para el modal correspondiente.
  const configurablesFiltrados = useMemo(() => {
    const texto = configSearch.trim().toLowerCase();

    if (!texto) {
      return articulosConfigurables;
    }

    return articulosConfigurables.filter((articulo) => {
      const fuente = [articulo.code, articulo.name, articulo.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fuente.includes(texto);
    });
  }, [articulosConfigurables, configSearch]);

  // Aqui recalculo resumen economico del presupuesto cada vez que cambian lineas.
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

  // Aqui actualizo un campo concreto de una linea sin tocar el resto.
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

  // Aqui aplico un articulo estandar a la linea activa y relleno sus datos principales.
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

  // Aqui abro modal de articulos y precargo el texto del articulo actual si existe.
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

  // Aqui cierro modal de articulos y limpio el indice de linea activa.
  const cerrarModalArticulos = () => {
    setIsArticleModalOpen(false);
    setActiveLineIndex(null);
  };

  // Aqui selecciono articulo desde modal y lo aplico a la linea activa.
  const seleccionarArticuloDesdeModal = (articulo) => {
    if (activeLineIndex === null) {
      return;
    }

    seleccionarArticuloEnLinea(activeLineIndex, articulo);
    cerrarModalArticulos();
  };

  // Aqui convierto la linea en manual quitando articulo estandar seleccionado.
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

  // Aqui navego a la pantalla de configuracion y envio el estado para no perder datos.
  const abrirPaginaConfigurable = (
    articuloId,
    lineIndex,
    initialConfiguration = null,
  ) => {
    navigate("/adminPanel/presupuestos/configurar-articulo", {
      state: {
        articuloId,
        lineIndex,
        initialConfiguration,
        returnTo: location.pathname,
        // Guardar datos actuales del formulario para no perderlos
        formData,
        lines,
      },
    });
  };

  // Aqui reabro la edicion de una linea configurable existente.
  const abrirEdicionConfigurable = (index) => {
    const line = lines[index];
    if (!line?._isConfigurable || !line?._configurable_article_id) {
      return;
    }

    abrirPaginaConfigurable(
      line._configurable_article_id,
      index,
      line._configuration || null,
    );
  };

  // Aqui creo una nueva linea configurable:
  // - si hay 1, entro directo a configurarlo
  // - si hay más de 1, abro el modal para elegir
  const abrirNuevoConfigurable = () => {
    if (!articulosConfigurables.length) {
      showNotification(
        "Sin configurables",
        "No hay artículos configurables disponibles.",
        "error",
      );
      return;
    }

    if (articulosConfigurables.length === 1) {
      abrirPaginaConfigurable(articulosConfigurables[0].id, lines.length, null);
      return;
    }

    setConfigSearch("");
    setIsConfigListModalOpen(true);
  };

  // Aqui recupero resultado de la pantalla configurable y restauro el formulario al volver.
  useEffect(() => {
    const result = location.state?.configurableResult;
    const lineIndex = location.state?.lineIndex;
    const savedFormData = location.state?.formData;
    const savedLines = location.state?.lines;

    // Restaurar datos del formulario si vienen guardados
    if (savedFormData) {
      setFormData(savedFormData);
    }

    if (!result || lineIndex === null || lineIndex === undefined) {
      return;
    }

    // Construir la línea configurable con todos sus datos
    const lineaConfigurable = {
      ...(savedLines?.[lineIndex] || {}),
      standard_article_id: "",
      name: result.name,
      description: result.description,
      quantity: savedLines?.[lineIndex]?.quantity || "1",
      unit_price: String(result.unit_price),
      discount_percentage: savedLines?.[lineIndex]?.discount_percentage || "0",
      tax_percentage: String(result.tax_percentage),
      _configurable_article_id: result.configurable_article_id,
      _configuration: result.configuration,
      _isConfigurable: true,
    };

    // Aplicar la configuración directamente sobre las líneas restauradas
    const baseLines = savedLines ? [...savedLines] : [];
    if (lineIndex >= baseLines.length) {
      baseLines.push(lineaConfigurable);
    } else {
      baseLines[lineIndex] = lineaConfigurable;
    }
    setLines(baseLines);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location.state, location.pathname, navigate]);

  // Aqui anado una linea nueva al presupuesto.
  const addLinea = () => {
    setLines((prev) => [...prev, crearLinea()]);
  };

  // Aqui elimino una linea concreta del presupuesto.
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

  // Aqui valido el formulario, construyo payload y envio create/update al backend.
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
      lines: lines.map((line, index) => {
        const baseLine = {
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
        };

        const esConfigurable =
          line._isConfigurable ||
          line._configurable_article_id ||
          line._configuration;

        if (esConfigurable) {
          baseLine.configurable_article_id = line._configurable_article_id
            ? Number(line._configurable_article_id)
            : null;
          baseLine.configuration = line._configuration || null;
        }

        return baseLine;
      }),
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

  // Aqui muestro estado de carga inicial mientras hidrato datos del formulario.
  if (loadingForm) {
    return <div className="container w-full mt-1">Cargando presupuesto...</div>;
  }

  // Aqui renderizo el formulario completo con modales, lineas y resumen de importes.
  return (
    <div className="container w-full mt-1">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto rounded-md border border-orange-500 p-8 shadow-md"
      >
        {/* CABECERA DEL FORMULARIO */}
        <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
        </h2>
        {isEdit && budgetNumber && (
          <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            Número de presupuesto: <strong>{budgetNumber}</strong>
          </div>
        )}
        {/* DATOS GENERALES DEL PRESUPUESTO */}
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
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Fecha en formato DD/MM/AAAA:{" "}
              {formatearFechaPresupuesto(formData.budget_date)}
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">Estado</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, status: "pendiente" }))
                  }
                  className={`flex-1 rounded-md px-4 py-2 font-semibold transition ${
                    formData.status === "pendiente"
                      ? "border-2 border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Pendiente
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, status: "aceptado" }))
                  }
                  className={`flex-1 rounded-md px-4 py-2 font-semibold transition ${
                    formData.status === "aceptado"
                      ? "border-2 border-green-500 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Aceptado
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* MODAL DE CLIENTES */}
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
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, client_id: null }));
                      setClientSearch("");
                    }}
                    className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-gray-200 dark:hover:bg-blue-700"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Buscador superior estilo panel de clientes. */}
                <div className="mb-3 w-full">
                  <UserSearch value={clientSearch} onChange={setClientSearch} />
                </div>

                {/* LISTADO FILTRADO DE CLIENTES (VISIBLE EN MODAL) */}
                <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
                  {clientesFiltrados.map((cliente) => {
                    const seleccionado =
                      String(cliente.id) === String(formData.client_id);

                    return (
                      //article es la etique html para cada cleinte.
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
        {/* MODAL DE ARTICULOS */}
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

                {/* LISTADO FILTRADO DE ARTICULOS ESTANDAR */}
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
        {/* MODAL DE CONFIGURABLES */}
        {isConfigListModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 px-3"
            onClick={() => setIsConfigListModalOpen(false)}
          >
            <div
              className="w-full max-w-3xl rounded-lg border border-orange-300 bg-white shadow-xl dark:border-orange-500 dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-orange-200 px-4 py-3 dark:border-orange-500/60">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  Seleccionar artículo configurable
                </h3>
                <button
                  type="button"
                  onClick={() => setIsConfigListModalOpen(false)}
                  className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="p-4">
                <div className="mb-3 w-full">
                  <UserSearch value={configSearch} onChange={setConfigSearch} />
                </div>

                {/* LISTADO FILTRADO DE ARTICULOS CONFIGURABLES */}
                <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
                  {configurablesFiltrados.map((art) => (
                    <article
                      key={art.id}
                      className="rounded-lg border border-orange-200 bg-white px-3 py-2 shadow-sm dark:border-orange-500/40 dark:bg-gray-800"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {art.code} - {art.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {art.description || "Sin descripción"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            abrirPaginaConfigurable(art.id, lines.length, null);
                            setIsConfigListModalOpen(false);
                          }}
                          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </article>
                  ))}

                  {!configurablesFiltrados.length && (
                    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-4 text-center text-sm text-orange-800 dark:border-orange-500/60 dark:bg-orange-900/20 dark:text-orange-100">
                      No hay artículos configurables que coincidan con la
                      búsqueda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* OBSERVACIONES GENERALES DEL PRESUPUESTO */}
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
        {/* BLOQUE DE LINEAS DEL PRESUPUESTO */}
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
                  {line._isConfigurable
                    ? `Artículo configurable: ${line.name || "Sin nombre"}`
                    : line.standard_article_id
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

                {line._isConfigurable && (
                  <div className="mt-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-900 dark:border-purple-500/50 dark:bg-purple-900/20 dark:text-purple-100">
                    <div className="mb-2 font-semibold">Línea configurable</div>
                    <button
                      type="button"
                      onClick={() => abrirEdicionConfigurable(index)}
                      className="rounded-md bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-700"
                    >
                      Editar configuración
                    </button>
                  </div>
                )}
              </div>

              {!line.standard_article_id && !line._isConfigurable && (
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
        {/* ACCIONES DE LINEAS (ANADIR ESTANDAR / ANADIR CONFIGURABLE) */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={addLinea}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Añadir línea
          </button>

          {/* Botón para agregar artículo configurable */}
          {articulosConfigurables.length > 0 && (
            <button
              type="button"
              onClick={abrirNuevoConfigurable}
              className="rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
            >
              + Artículo Configurable
            </button>
          )}
        </div>
        {/* RESUMEN ECONOMICO CALCULADO EN TIEMPO REAL */}
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
        {/* ENVIO FINAL DEL PRESUPUESTO (CREATE / UPDATE) */}
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
