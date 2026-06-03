import { useState, useEffect } from "react";
import {
  obtenerArticuloConfigurable,
  calcularArticuloConfigurable,
} from "../../services/articulosConfigurables";

// Aqui normalizo los params de cada regla porque a veces vienen ya como objeto y otras como JSON.
function parseRuleParams(params) {
  if (!params) return {};
  if (typeof params === "object") return params;
  try {
    return JSON.parse(params);
  } catch {
    return {};
  }
}

// Aqui valido en frontend las medidas usando las reglas dinámicas que vienen del backend.
function validarMedidasConReglas(medidas, rules = [], touched = {}) {
  const errors = {};

  // Solo añado errores a campos ya tocados para no ensuciar la UI antes de tiempo.
  const addError = (field, message) => {
    if (!touched[field]) return;
    if (!errors[field]) errors[field] = [];
    if (errors[field].includes(message)) return;
    errors[field].push(message);
  };

  // Convierto a número de forma segura para poder comparar medidas sin NaN raros.
  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  rules.forEach((rule) => {
    const field = rule?.field;
    const params = parseRuleParams(rule?.params);
    const value = toNumber(medidas[field]);

    if (!field) return;

    switch (rule.type) {
      case "required": {
        if (
          medidas[field] === "" ||
          medidas[field] === null ||
          medidas[field] === undefined
        ) {
          addError(field, rule.message);
        }
        break;
      }
      case "min_value": {
        const minValue = Number(params?.value);
        if (value !== null && Number.isFinite(minValue) && value < minValue) {
          addError(field, rule.message);
        }
        break;
      }
      case "max_value": {
        const maxValue = Number(params?.value);
        if (value !== null && Number.isFinite(maxValue) && value > maxValue) {
          addError(field, rule.message);
        }
        break;
      }
      case "min_diff": {
        const aField = params?.field_a;
        const bField = params?.field_b;
        const minDiff = Number(params?.min);
        const aValue = toNumber(medidas[aField]);
        const bValue = toNumber(medidas[bField]);
        if (
          aField &&
          bField &&
          Number.isFinite(minDiff) &&
          aValue !== null &&
          bValue !== null &&
          aValue - bValue < minDiff
        ) {
          addError(field, rule.message);
        }
        break;
      }
      default:
        break;
    }
  });

  // Fallback de seguridad en frontend para PTA2H2FSP:
  // aunque falte alguna regla dinámica en BD, mantenemos estas reglas clave en UI.
  const dValue = toNumber(medidas.alto_hueco);
  if (touched.alto_hueco && dValue !== null && dValue > 3000) {
    addError("alto_hueco", "La medida D no puede ser superior a 3000mm.");
  }

  const aValue = toNumber(medidas.alto_obra);
  if (
    touched.alto_obra &&
    aValue !== null &&
    dValue !== null &&
    aValue - dValue < 140
  ) {
    addError(
      "alto_obra",
      "La medida A debe ser al menos 140mm mayor que la medida D.",
    );
  }

  const bValue = toNumber(medidas.ancho_obra);
  const cValue = toNumber(medidas.ancho_hueco);
  if (
    touched.ancho_obra &&
    bValue !== null &&
    cValue !== null &&
    bValue < cValue
  ) {
    addError(
      "ancho_obra",
      "La medida B (ancho obra) no puede ser inferior a C (ancho hueco libre).",
    );
  }

  return errors;
}

// Aqui calculo al vuelo las medidas de fabricación para enseñarlas sin esperar al backend.
function calcularMedidasFabricacionLive(medidas) {
  const c = Number(medidas.ancho_hueco);
  const d = Number(medidas.alto_hueco);
  const hasC = Number.isFinite(c) && medidas.ancho_hueco !== "";
  const hasD = Number.isFinite(d) && medidas.alto_hueco !== "";

  const valueOrNull = (calc, ready) => (ready ? Number(calc.toFixed(2)) : null);

  return {
    ancho_cristal_fijos_laterales: {
      label: "Ancho cristal de fijos laterales",
      formula: "(C/4) + 45",
      value_mm: valueOrNull(c / 4 + 45, hasC),
    },
    alto_cristal_fijos_laterales: {
      label: "Alto cristal de los fijos laterales",
      formula: "D",
      value_mm: valueOrNull(d, hasD),
    },
    ancho_cristal_hojas_moviles: {
      label: "Ancho cristal de las hojas moviles",
      formula: "(C/4) - 5",
      value_mm: valueOrNull(c / 4 - 5, hasC),
    },
    alto_cristal_hojas_moviles_sin_perfil_plinton: {
      label: "Alto cristal de las hojas moviles (sin perfil plinton)",
      formula: "D - 50",
      value_mm: valueOrNull(d - 50, hasD),
    },
    ancho_hueco_paso_libre_final: {
      label: "Ancho hueco de paso libre final",
      formula: "C - ((C/4) + 45) * 2",
      value_mm: valueOrNull(c - (c / 4 + 45) * 2, hasC),
    },
    alto_hueco_paso_libre: {
      label: "Alto hueco de paso libre",
      formula: "D",
      value_mm: valueOrNull(d, hasD),
    },
  };
}

const COTAS_IMAGE_BY_CODE = {
  PTA2H2FSP: "/cotas/PTA2H2FSP-cotas.svg",
};

/**
 * Modal para configurar un artículo configurable antes de añadirlo al presupuesto.
 *
 * Props:
 *  - articuloId   : ID del artículo configurable seleccionado
 *  - onConfirmar  : fn({ name, description, unit_price, tax_percentage, configuration })
 *  - onCerrar     : fn() — cierra el modal sin añadir nada
 */
export function ModalArticuloConfigurable({
  articuloId,
  initialConfiguration = null,
  onConfirmar,
  onCerrar,
  asPage = false,
}) {
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Aqui guardo las medidas que escribe el usuario.
  const [medidas, setMedidas] = useState({
    ancho_hueco: "",
    alto_hueco: "",
    ancho_obra: "",
    alto_obra: "",
  });

  // Aqui guardo la opcion elegida en cada parte configurable.
  const [opciones, setOpciones] = useState({});

  // Aqui guardo el resultado del cálculo de precio y validación.
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});
  const [calculando, setCalculando] = useState(false);
  const [touched, setTouched] = useState({});

  // Este objeto me sirve para forzar una validacion completa cuando recalculo automáticamente.
  const touchedAll = {
    ancho_hueco: true,
    alto_hueco: true,
    ancho_obra: true,
    alto_obra: true,
  };

  // Aqui cargo el artículo configurable al abrir el modal o la página.
  useEffect(() => {
    if (!articuloId) return;

    // Reinicio al abrir para evitar que se mezclen datos de artículos distintos.
    setMedidas({
      ancho_hueco: "",
      alto_hueco: "",
      ancho_obra: "",
      alto_obra: "",
    });
    setOpciones({});
    setResultado(null);
    setErrores({});
    setTouched({});

    setCargando(true);
    obtenerArticuloConfigurable(articuloId)
      .then((data) => {
        setArticulo(data);
        // Aqui preselecciono la opción por defecto de cada parte para no empezar vacío.
        const defaults = {};
        data.parts?.forEach((part) => {
          const def =
            part.options?.find((o) => o.is_default) ?? part.options?.[0];
          if (def) defaults[part.key] = def.key;
        });

        // Si vengo de una edición previa, mezclo lo que ya había elegido con los defaults.
        const initialOptions = initialConfiguration?.options_chosen ?? {};
        setOpciones({ ...defaults, ...initialOptions });

        if (initialConfiguration) {
          // Si estoy reabriendo una línea ya configurada, restauro medidas y desglose previo.
          setMedidas({
            ancho_hueco: initialConfiguration.ancho_hueco ?? "",
            alto_hueco: initialConfiguration.alto_hueco ?? "",
            ancho_obra: initialConfiguration.ancho_obra ?? "",
            alto_obra: initialConfiguration.alto_obra ?? "",
          });

          const breakdown = initialConfiguration.price_breakdown ?? null;
          if (breakdown && typeof breakdown === "object") {
            const total = Object.values(breakdown).reduce(
              (acc, item) => acc + Number(item?.price || 0),
              0,
            );
            setResultado({
              valid: true,
              breakdown,
              total,
            });
          }
        }
      })
      .catch(() => setArticulo(null))
      .finally(() => setCargando(false));
  }, [articuloId, initialConfiguration]);

  // Aqui actualizo una medida, marco el campo como tocado y vuelvo a validar.
  function handleMedida(e) {
    const { name, value } = e.target;
    const nextTouched = { ...touched, [name]: true };
    const nextMedidas = { ...medidas, [name]: value };

    setTouched(nextTouched);
    setMedidas(nextMedidas);
    setErrores(
      validarMedidasConReglas(nextMedidas, articulo?.rules, nextTouched),
    );
    setResultado(null);
  }

  // Aqui guardo la opción elegida en una parte y fuerzo recálculo del precio.
  function handleOpcion(partKey, optionKey) {
    setOpciones((prev) => ({ ...prev, [partKey]: optionKey }));
    setResultado(null);
  }

  // Aqui recalculo el precio automáticamente cuando cambian medidas u opciones válidas.
  useEffect(() => {
    if (!articuloId || !articulo) return;

    // Primero detecto qué campos son obligatorios según las reglas activas del artículo.
    const rules = articulo.rules ?? [];
    const requiredFields = [
      ...new Set(
        rules
          .filter((rule) => rule.type === "required")
          .map((rule) => rule.field),
      ),
    ];

    // No llamo al backend hasta que todos los obligatorios tengan valor.
    const hasRequiredValues = requiredFields.every((field) => {
      const value = medidas[field];
      return value !== "" && value !== null && value !== undefined;
    });

    // Hago una validación completa antes de disparar el cálculo remoto.
    const frontErrors = validarMedidasConReglas(medidas, rules, touchedAll);
    if (!hasRequiredValues || Object.keys(frontErrors).length > 0) {
      setResultado(null);
      return;
    }

    // Meto un pequeño debounce para no bombardear al backend en cada tecla.
    const timerId = setTimeout(async () => {
      setCalculando(true);
      try {
        // Solo envío medidas rellenas y las opciones actualmente elegidas.
        const payload = {
          ...Object.fromEntries(
            Object.entries(medidas).filter(([, v]) => v !== ""),
          ),
          options: opciones,
        };
        const res = await calcularArticuloConfigurable(articuloId, payload);
        setResultado(res);
      } catch (err) {
        setResultado(null);
        if (err.response?.status === 422) {
          setErrores(err.response.data.errors ?? {});
        }
      } finally {
        setCalculando(false);
      }
    }, 250);

    return () => clearTimeout(timerId);
  }, [articuloId, articulo, medidas, opciones]);

  // Aqui empaqueto toda la configuración final y se la devuelvo al presupuesto padre.
  function handleConfirmar() {
    if (!resultado?.valid) return;

    // Siempre usamos el cálculo local: tiene labels completos y valores actualizados
    const medidasObj = calcularMedidasFabricacionLive(medidas);

    // Normalizar a array [{label, formula, valor}] para consistencia en toda la app
    const fabricationMeasuresArray = Object.values(medidasObj).map((m) => ({
      label: m.label,
      formula: m.formula,
      valor: m.value_mm,
    }));

    onConfirmar({
      configurable_article_id: articulo.id,
      name: articulo.code + " — " + articulo.name,
      description: construirDescripcion(),
      unit_price: resultado.total,
      tax_percentage: articulo.tax_percentage,
      configuration: {
        ...medidas,
        options_chosen: opciones,
        price_breakdown: resultado.breakdown,
        fabrication_measures: fabricationMeasuresArray,
      },
    });
  }

  // Aqui construyo una descripción resumida para que la línea configurable quede legible en el presupuesto.
  function construirDescripcion() {
    const lineas = [];
    if (medidas.ancho_hueco)
      lineas.push(`Ancho hueco: ${medidas.ancho_hueco}mm`);
    if (medidas.alto_hueco) lineas.push(`Alto hueco: ${medidas.alto_hueco}mm`);
    if (medidas.ancho_obra) lineas.push(`Ancho obra: ${medidas.ancho_obra}mm`);
    if (medidas.alto_obra) lineas.push(`Alto obra: ${medidas.alto_obra}mm`);
    Object.entries(resultado?.breakdown ?? {}).forEach(([, v]) => {
      lineas.push(`${v.label}: ${v.price.toFixed(2)}€`);
    });
    return lineas.join(" | ");
  }

  // Si no tengo artículo, no renderizo nada porque este modal depende totalmente de ese contexto.
  if (!articuloId) return null;

  // Aqui resuelvo la imagen guía de cotas según el código del artículo.
  const cotasImageUrl = articulo?.code
    ? (COTAS_IMAGE_BY_CODE[articulo.code] ?? "")
    : "";

  // Estas clases cambian el contenedor según si lo renderizo como página completa o como modal flotante.
  const shellClasses = asPage
    ? "min-h-[calc(100vh-96px)] w-full bg-white px-4 py-4 dark:bg-gray-950 md:px-6"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4";

  const cardClasses = asPage
    ? "mx-auto w-full max-w-7xl rounded-xl border border-orange-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
    : "w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-900";

  const medidasFabricacionLive = calcularMedidasFabricacionLive(medidas);

  return (
    <div className={shellClasses}>
      <div className={cardClasses}>
        {/* Aqui muestro la cabecera con título dinámico y el botón para volver o cerrar. */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold dark:text-white">
            {cargando
              ? "Cargando…"
              : articulo
                ? `${articulo.code} — ${articulo.name}`
                : "Error"}
          </h2>
          <button
            onClick={onCerrar}
            className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {asPage ? "Volver" : "Cerrar"}
          </button>
        </div>

        {cargando && (
          <p className="p-6 text-gray-500 dark:text-gray-400">
            Cargando artículo…
          </p>
        )}

        {!cargando && articulo && (
          <div className="p-6 space-y-6">
            {cotasImageUrl && (
              <section>
                {/* Aqui enseño la guía visual de cotas solo si existe una imagen asociada al código. */}
                <h3 className="font-semibold mb-3 dark:text-white">
                  Guía de cotas ({articulo.code})
                </h3>
                <img
                  src={cotasImageUrl}
                  alt={`Cotas de instalación para ${articulo.code}`}
                  className="w-full max-h-[650px] object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </section>
            )}

            {/* Aqui pinto las medidas que el usuario tiene que informar para configurar el artículo. */}
            <section>
              <h3 className="font-semibold mb-3 dark:text-white">
                Medidas (en mm)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "ancho_hueco", label: "C — Ancho hueco libre *" },
                  { key: "alto_hueco", label: "D — Alto hueco libre *" },
                  { key: "ancho_obra", label: "B — Ancho obra total" },
                  { key: "alto_obra", label: "A — Alto obra total *" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm mb-1 dark:text-gray-300">
                      {label}
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={medidas[key]}
                      onChange={handleMedida}
                      min={0}
                      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      placeholder="mm"
                    />
                    {errores[key]?.map((msg, i) => (
                      <p key={i} className="text-red-500 text-xs mt-1">
                        {msg}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Aqui pinto los grupos de opciones configurables por cada parte del artículo. */}
            <section>
              <h3 className="font-semibold mb-3 dark:text-white">Opciones</h3>
              <div className="space-y-3">
                {articulo.parts?.map((part) => (
                  <div key={part.key} className="flex items-center gap-4">
                    <span className="w-36 text-sm dark:text-gray-300">
                      {part.name}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {part.options?.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleOpcion(part.key, opt.key)}
                          className={`px-3 py-1 rounded text-sm border transition-colors ${
                            opciones[part.key] === opt.key
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border rounded-lg p-4 dark:border-gray-700">
              {/* Aqui enseño las medidas de fabricación calculadas en directo para que el usuario vea el resultado técnico. */}
              <h3 className="font-semibold mb-3 dark:text-white">
                Medidas de fabricación
              </h3>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Se actualizan al escribir C y D. Se guardan en la configuración
                para usarlas después al generar pedido.
              </p>
              <div className="space-y-2">
                {Object.entries(medidasFabricacionLive).map(([key, item]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-1 rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 md:grid-cols-[1fr_auto]"
                  >
                    <div className="dark:text-gray-300">
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({item.formula})
                      </span>
                    </div>
                    <div className="font-mono dark:text-gray-200">
                      {item.value_mm === null ? "-" : `${item.value_mm} mm`}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Aqui muestro el desglose de precio que devuelve el cálculo del configurable. */}
            <section className="border rounded-lg p-4 dark:border-gray-700 space-y-2">
              <h3 className="font-semibold dark:text-white">Desglose</h3>
              {calculando && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recalculando precio...
                </p>
              )}
              {!calculando && resultado?.valid && (
                <>
                  {Object.entries(resultado.breakdown).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm dark:text-gray-300"
                    >
                      <span>{val.label}</span>
                      <span className="font-mono">
                        {val.price.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-600 dark:text-white">
                    <span>Total</span>
                    <span className="font-mono">
                      {resultado.total.toFixed(2)} €
                    </span>
                  </div>
                </>
              )}
              {!calculando && !resultado?.valid && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Completa las medidas obligatorias y corrige errores para ver
                  el precio en tiempo real.
                </p>
              )}
            </section>
          </div>
        )}

        {/* Aqui dejo las acciones finales: cancelar o confirmar y añadir la línea al presupuesto. */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 rounded border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!resultado?.valid}
            className="px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-40"
          >
            Añadir al presupuesto
          </button>
        </div>
      </div>
    </div>
  );
}
