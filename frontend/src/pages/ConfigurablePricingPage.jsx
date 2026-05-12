import { useEffect, useMemo, useState } from "react";
import {
  guardarPricingArticuloConfigurable,
  listarArticulosConfigurables,
  obtenerPricingArticuloConfigurable,
} from "../services/articulosConfigurables";

export default function ConfigurablePricingPage() {
  const [articulos, setArticulos] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [pricing, setPricing] = useState(null);
  const [draftPrices, setDraftPrices] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function cargarArticulos() {
      setCargando(true);
      setError("");
      try {
        const data = await listarArticulosConfigurables();
        if (!mounted) return;
        setArticulos(data ?? []);

        if (data?.length > 0) {
          setArticuloId(String(data[0].id));
        }
      } catch {
        if (!mounted) return;
        setError("No se pudieron cargar los artículos configurables.");
      } finally {
        if (mounted) setCargando(false);
      }
    }

    cargarArticulos();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!articuloId) {
      setPricing(null);
      setDraftPrices({});
      return;
    }

    async function cargarPricing() {
      setError("");
      setMensaje("");
      try {
        const data = await obtenerPricingArticuloConfigurable(articuloId);
        if (!mounted) return;
        setPricing(data);

        const initialDraft = {};
        (data?.parts ?? []).forEach((part) => {
          (part.options ?? []).forEach((opt) => {
            initialDraft[opt.option_id] = String(opt.effective_price ?? "");
          });
        });
        setDraftPrices(initialDraft);
      } catch {
        if (!mounted) return;
        setError("No se pudo cargar la configuración de tarifas.");
      }
    }

    cargarPricing();
    return () => {
      mounted = false;
    };
  }, [articuloId]);

  const articuloSeleccionado = useMemo(() => {
    return articulos.find((a) => String(a.id) === String(articuloId)) ?? null;
  }, [articulos, articuloId]);

  function onChangePrecio(optionId, value) {
    setDraftPrices((prev) => ({ ...prev, [optionId]: value }));
    setMensaje("");
  }

  async function guardar() {
    if (!pricing) return;

    const prices = [];
    for (const part of pricing.parts ?? []) {
      for (const opt of part.options ?? []) {
        const value = draftPrices[opt.option_id];
        const parsed = Number(value);

        if (value === "" || !Number.isFinite(parsed) || parsed < 0) {
          setError(
            "Todos los precios deben ser numéricos y mayores o iguales a 0.",
          );
          return;
        }

        prices.push({
          option_id: opt.option_id,
          price: parsed,
        });
      }
    }

    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await guardarPricingArticuloConfigurable(articuloId, prices);
      const refreshed = await obtenerPricingArticuloConfigurable(articuloId);
      setPricing(refreshed);

      const refreshedDraft = {};
      (refreshed?.parts ?? []).forEach((part) => {
        (part.options ?? []).forEach((opt) => {
          refreshedDraft[opt.option_id] = String(opt.effective_price ?? "");
        });
      });
      setDraftPrices(refreshedDraft);

      setMensaje("Tarifas guardadas correctamente.");
    } catch {
      setError("No se pudieron guardar las tarifas.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-orange-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-xl font-semibold dark:text-white">
          Tarifas configurables
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Edita los precios por empresa para cajón, mecanismo, cristal (m2), ml
          y conceptos fijos.
        </p>
      </div>

      <div className="rounded-lg border border-orange-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <label
          className="mb-1 block text-sm font-medium dark:text-gray-200"
          htmlFor="articulo-configurable-select"
        >
          Artículo configurable
        </label>
        <select
          id="articulo-configurable-select"
          value={articuloId}
          onChange={(e) => setArticuloId(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          disabled={cargando || articulos.length === 0}
        >
          {articulos.length === 0 && (
            <option value="">Sin artículos configurables</option>
          )}
          {articulos.map((art) => (
            <option key={art.id} value={art.id}>
              {art.code} - {art.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {articuloSeleccionado && pricing && (
        <div className="space-y-3 rounded-lg border border-orange-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold dark:text-white">
            {articuloSeleccionado.code} - {articuloSeleccionado.name}
          </h2>

          {(pricing.parts ?? []).map((part) => (
            <div
              key={part.part_id}
              className="rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                {part.part_name} ({part.unit})
              </div>

              <div className="space-y-2 p-3">
                {(part.options ?? []).map((opt) => (
                  <div
                    key={opt.option_id}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px_120px_160px] md:items-center"
                  >
                    <div className="text-sm dark:text-gray-200">
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Base: {Number(opt.base_price).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Efectivo: {Number(opt.effective_price).toFixed(2)}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftPrices[opt.option_id] ?? ""}
                      onChange={(e) =>
                        onChangePrecio(opt.option_id, e.target.value)
                      }
                      className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar tarifas"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
