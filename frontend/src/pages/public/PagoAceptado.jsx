import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PagoAceptado() {
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  useEffect(() => {
    const confirmarPago = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setMensajeConfirmacion(
          "Pago recibido. No se detecto session_id para enviar el correo automaticamente.",
        );
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      try {
        const response = await fetch(`${apiUrl}/api/checkout/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "No se pudo confirmar el pago.");
        }

        setMensajeConfirmacion(
          data?.message ||
            "Pago confirmado. Te hemos enviado un correo para el registro de empresa.",
        );
      } catch (error) {
        setMensajeConfirmacion(
          error?.message ||
            "Pago recibido, pero no se pudo confirmar el envio del correo.",
        );
      }
    };

    void confirmarPago();
  }, []);

  return (
    <section className="mt-16 min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-16 dark:bg-gray-800">
      <div className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm dark:border-green-900 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-green-600">
          Pago realizado correctamente
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-200">
          Gracias por tu compra. Hemos confirmado tu pago y tu plan ya esta
          activo.
        </p>
        <p className="mt-4  px-4 py-3 text-base font-medium text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
          {mensajeConfirmacion ===
          "Pago verificado y correo de registro enviado."
            ? "Pago verificado y CORREO ELECTRÓNICO de registro enviado."
            : mensajeConfirmacion}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/adminPanel"
            className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            Ir al panel
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
