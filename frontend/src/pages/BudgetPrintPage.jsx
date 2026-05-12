import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerPresupuestoEmpresa } from "../services/presupuestos";

const LOGO_SRC = "/logo_MetricGate.png";

function formatCurrency(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatDate(value) {
  if (!value) return "-";
  return value;
}

function waitForImagesLoaded(container) {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const finish = () => resolve();
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
      });
    }),
  );
}

export default function BudgetPrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBudget() {
      if (!id) {
        setError("Presupuesto no encontrado.");
        setLoading(false);
        return;
      }

      try {
        const data = await obtenerPresupuestoEmpresa(id);
        if (!active) return;
        setBudget(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || "No se pudo cargar el presupuesto.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBudget();
    return () => {
      active = false;
    };
  }, [id]);

  const clientName = useMemo(() => {
    return budget?.client?.nombre || "Cliente";
  }, [budget]);

  async function handleGeneratePdf() {
    if (!printRef.current || !budget) return;

    setGeneratingPdf(true);
    setPdfError("");

    try {
      await waitForImagesLoaded(printRef.current);

      const { default: html2pdf } = await import("html2pdf.js");
      const fileName = `${budget.budget_number || "presupuesto"}.pdf`;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: fileName,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 1.2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            imageTimeout: 15000,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(printRef.current)
        .save();
    } catch (err) {
      setPdfError(err?.message || "No se pudo generar el PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-[#111827]">
        Cargando presupuesto...
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded border border-[#fecaca] bg-[#fef2f2] p-4 text-[#b91c1c]">
          {error || "No se pudo abrir el presupuesto."}
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded bg-[#374151] px-4 py-2 text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 print:bg-white print:p-0">
      <div
        ref={printRef}
        className="mx-auto max-w-4xl rounded-lg bg-white p-8 text-[#111827] shadow print:max-w-none print:rounded-none print:p-6 print:shadow-none"
      >
        <div className="mb-8 flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex flex-col items-start">
            <img src={LOGO_SRC} alt="MetricGate" className="h-32 w-auto" />
            <h1 className="mt-2 text-base font-bold text-[#111827]">
              Presupuesto
            </h1>
          </div>
          <div className="text-right text-sm text-[#374151]">
            <div>
              <strong>Número:</strong> {budget.budget_number}
            </div>
            <div>
              <strong>Fecha:</strong> {formatDate(budget.budget_date)}
            </div>
            <div>
              <strong>Estado:</strong> {budget.status}
            </div>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Cliente
            </h2>
            <div className="text-lg font-semibold text-[#111827]">
              {clientName}
            </div>
            <div className="text-sm text-[#374151]">
              {budget.client?.dni || ""}
            </div>
            <div className="text-sm text-[#374151]">
              {budget.client?.telefono || ""}
            </div>
            <div className="text-sm text-[#374151]">
              {budget.client?.direccion || ""}
            </div>
            <div className="text-sm text-[#374151]">
              {[
                budget.client?.codigo_postal,
                budget.client?.poblacion,
                budget.client?.provincia,
              ]
                .filter(Boolean)
                .join(" ")}
            </div>
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Resumen
            </h2>
            <div className="flex justify-between text-sm text-[#374151]">
              <span>Base imponible</span>
              <span>{formatCurrency(budget.base_amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#374151]">
              <span>IVA</span>
              <span>{formatCurrency(budget.tax_amount)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold text-[#111827]">
              <span>Total</span>
              <span>{formatCurrency(budget.total_amount)}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#111827]">Líneas</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f3f4f6] text-left">
                <th className="border px-3 py-2">Concepto</th>
                <th className="border px-3 py-2">Descripción</th>
                <th className="border px-3 py-2 text-center">Cant.</th>
                <th className="border px-3 py-2 text-right">P. unit.</th>
                <th className="border px-3 py-2 text-right">Desc.</th>
                <th className="border px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(budget.lines || []).map((line) => (
                <tr key={line.id}>
                  <td className="border px-3 py-2 align-top font-medium">
                    {line.name}
                  </td>
                  <td className="border px-3 py-2 align-top whitespace-pre-wrap">
                    {line.description || "-"}
                  </td>
                  <td className="border px-3 py-2 text-center align-top">
                    {Number(line.quantity).toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-right align-top">
                    {formatCurrency(line.unit_price)}
                  </td>
                  <td className="border px-3 py-2 text-right align-top">
                    {Number(line.discount_percentage || 0).toFixed(2)} %
                  </td>
                  <td className="border px-3 py-2 text-right align-top">
                    {formatCurrency(line.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {budget.notes && (
          <section className="mt-8 rounded border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Notas
            </h2>
            <p className="whitespace-pre-wrap text-sm text-[#374151]">
              {budget.notes}
            </p>
          </section>
        )}

        <div className="mt-8 flex gap-3 print:hidden" data-pdf-ignore="true">
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="rounded bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea580c] disabled:opacity-50"
          >
            {generatingPdf ? "Generando PDF..." : "Descargar PDF"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded bg-[#374151] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
          >
            Volver
          </button>
        </div>

        {pdfError && (
          <div className="mt-3 rounded border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] print:hidden">
            {pdfError}
          </div>
        )}
      </div>
    </div>
  );
}
