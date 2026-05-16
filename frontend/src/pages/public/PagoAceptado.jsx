import { Link } from "react-router-dom";

export default function PagoAceptado() {
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
