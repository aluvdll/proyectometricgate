import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModalArticuloConfigurable } from "../../components/modals/ModalArticuloConfigurable";

export default function ConfigurarArticuloConfigurablePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const articuloId = location.state?.articuloId ?? null;
  const lineIndex = location.state?.lineIndex ?? null;
  const initialConfiguration = location.state?.initialConfiguration ?? null;
  const formData = location.state?.formData ?? null;
  const lines = location.state?.lines ?? null;

  const returnTo = useMemo(() => {
    return (
      location.state?.returnTo || "/adminPanel/presupuestos/nuevopresupuesto"
    );
  }, [location.state]);

  const volver = () => {
    navigate(returnTo);
  };

  const confirmar = (config) => {
    navigate(returnTo, {
      state: {
        configurableResult: config,
        lineIndex,
        // Devolver datos guardados para restaurarlos en FormPresupuesto
        formData,
        lines,
      },
    });
  };

  if (!articuloId) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se recibió el artículo configurable. Vuelve al presupuesto y
          selecciona uno.
          <div className="mt-3">
            <button
              type="button"
              onClick={volver}
              className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModalArticuloConfigurable
      articuloId={articuloId}
      initialConfiguration={initialConfiguration}
      onConfirmar={confirmar}
      onCerrar={volver}
      asPage
    />
  );
}
