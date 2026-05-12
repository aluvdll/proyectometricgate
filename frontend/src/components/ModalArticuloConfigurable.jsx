import { useState, useEffect } from "react";
import {
  obtenerArticuloConfigurable,
  calcularArticuloConfigurable,
} from "../services/articulosConfigurables";

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
}) {
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Medidas de entrada
  const [medidas, setMedidas] = useState({
    ancho_hueco: "",
    alto_hueco: "",
    ancho_obra: "",
    alto_obra: "",
    paso_deseado: "",
  });

  // Opciones elegidas por parte: { cajon: "ral_premium", hojas_moviles: "incoloro", ... }
  const [opciones, setOpciones] = useState({});

  // Resultado del cálculo
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});
  const [calculando, setCalculando] = useState(false);

  // ── Cargar artículo al abrir ────────────────────────────────────
  useEffect(() => {
    if (!articuloId) return;

    // Reinicio al abrir para evitar que se mezclen datos de artículos distintos.
    setMedidas({
      ancho_hueco: "",
      alto_hueco: "",
      ancho_obra: "",
      alto_obra: "",
      paso_deseado: "",
    });
    setOpciones({});
    setResultado(null);
    setErrores({});

    setCargando(true);
    obtenerArticuloConfigurable(articuloId)
      .then((data) => {
        setArticulo(data);
        // Preseleccionar la opción default de cada parte
        const defaults = {};
        data.parts?.forEach((part) => {
          const def =
            part.options?.find((o) => o.is_default) ?? part.options?.[0];
          if (def) defaults[part.key] = def.key;
        });

        const initialOptions = initialConfiguration?.options_chosen ?? {};
        setOpciones({ ...defaults, ...initialOptions });

        if (initialConfiguration) {
          setMedidas({
            ancho_hueco: initialConfiguration.ancho_hueco ?? "",
            alto_hueco: initialConfiguration.alto_hueco ?? "",
            ancho_obra: initialConfiguration.ancho_obra ?? "",
            alto_obra: initialConfiguration.alto_obra ?? "",
            paso_deseado: initialConfiguration.paso_deseado ?? "",
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

  // ── Handlers ────────────────────────────────────────────────────
  function handleMedida(e) {
    setMedidas((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResultado(null);
  }

  function handleOpcion(partKey, optionKey) {
    setOpciones((prev) => ({ ...prev, [partKey]: optionKey }));
    setResultado(null);
  }

  async function handleCalcular() {
    setCalculando(true);
    setErrores({});
    try {
      const payload = {
        ...Object.fromEntries(
          Object.entries(medidas).filter(([, v]) => v !== ""),
        ),
        options: opciones,
      };
      const res = await calcularArticuloConfigurable(articuloId, payload);
      setResultado(res);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrores(err.response.data.errors ?? {});
      }
    } finally {
      setCalculando(false);
    }
  }

  function handleConfirmar() {
    if (!resultado?.valid) return;

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
      },
    });
  }

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

  // ── Render ───────────────────────────────────────────────────────
  if (!articuloId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
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
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {cargando && (
          <p className="p-6 text-gray-500 dark:text-gray-400">
            Cargando artículo…
          </p>
        )}

        {!cargando && articulo && (
          <div className="p-6 space-y-6">
            {/* Medidas de entrada */}
            <section>
              <h3 className="font-semibold mb-3 dark:text-white">
                Medidas (en mm)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "ancho_hueco", label: "Ancho hueco libre *" },
                  { key: "alto_hueco", label: "Alto hueco libre *" },
                  { key: "ancho_obra", label: "Ancho obra total" },
                  { key: "alto_obra", label: "Alto obra total" },
                  { key: "paso_deseado", label: "Paso deseado" },
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

            {/* Opciones por parte */}
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

            {/* Botón calcular */}
            <button
              type="button"
              onClick={handleCalcular}
              disabled={calculando}
              className="w-full py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50"
            >
              {calculando ? "Calculando…" : "Calcular precio"}
            </button>

            {/* Resultado desglosado */}
            {resultado?.valid && (
              <section className="border rounded-lg p-4 dark:border-gray-700 space-y-2">
                <h3 className="font-semibold dark:text-white">Desglose</h3>
                {Object.entries(resultado.breakdown).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between text-sm dark:text-gray-300"
                  >
                    <span>{val.label}</span>
                    <span className="font-mono">{val.price.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-600 dark:text-white">
                  <span>Total</span>
                  <span className="font-mono">
                    {resultado.total.toFixed(2)} €
                  </span>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer */}
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
