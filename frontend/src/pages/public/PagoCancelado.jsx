import { Link } from "react-router-dom";

export default function PagoCancelado() {
  return (
    <section className="mt-16 min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-16 dark:bg-gray-800">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-red-600">Pago cancelado</h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-200">
          La operacion de pago se ha cancelado. No se ha realizado ningun cargo.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/tarifas"
            className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
          >
            Intentar de nuevo
          </Link>
          <Link
            to="/contacto"
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </section>
  );
}
