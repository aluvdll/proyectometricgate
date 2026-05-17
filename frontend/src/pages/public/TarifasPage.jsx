import { useState } from "react";
import { NotificationModal } from "../../components/modals/NotificationModal";

export const Tarifas = () => {
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const showNotification = (title, message, type = "success") => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 3500);
  };

  const handleCheckout = async (plan = "basica") => {
    try {
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        showNotification(
          "Configuracion incompleta",
          "Falta VITE_STRIPE_PUBLISHABLE_KEY en el archivo .env del frontend.",
          "error",
        );
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la sesion de pago.");
      }

      const session = await response.json();
      const sessionUrl = session?.url;

      if (!sessionUrl) {
        throw new Error("La respuesta del backend no incluye session.url.");
      }

      window.location.href = sessionUrl;
    } catch (error) {
      showNotification(
        "Error en el pago",
        error?.message ||
          "No se pudo iniciar el pago. Revisa backend, claves Stripe y red.",
        "error",
      );
    }
  };

  return (
    <>
      <section className="mt-15 flex items-center justify-center pb-10 dark:bg-gray-800">
        <div
          className="mx-auto flex h-100vh flex-col items-center justify-center p-4 text-base sm:px-10"
          id="pricing"
        >
          <h3 className="mb-10 flex justify-center gap-2 text-center text-5xl font-semibold">
            Precios a medida...
          </h3>
          <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id="tier-standard"
                  className="text-2xl font-semibold leading-8 text-gray-900 dark:text-white"
                >
                  Básica
                </h3>
              </div>
              <p className="mt-4 text-base leading-6 text-gray-900 dark:text-gray-100">
                Cuota mensual
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-2xl font-sans text-gray-500/70 line-through"></span>
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  150€/mes
                </span>
              </p>
              <button
                type="button"
                aria-describedby="tier-standard"
                className="mt-6 block rounded-md px-3 py-2 text-center text-base font-medium leading-6 text-orange-500 ring-1 ring-inset ring-blue-200 hover:border-2 hover:border-amber-50 hover:bg-orange-800"
                onClick={() => handleCheckout("basica")}
              >
                Paga ahora
              </button>
              <ul
                className="mt-8 space-y-3 text-sm leading-6 text-gray-900 dark:text-gray-100 xl:mt-10"
                role="list"
              >
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Paga cuando lo necesites, <br />
                  sin compromiso de permanencia
                </li>
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Respaldo de datos anuales por pago
                </li>
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Asistencia remota básica <br />
                  (3h mensuales con cita previa)
                </li>
              </ul>
            </div>
            <div className="rounded-3xl p-8 ring-2 ring-orange-500 xl:p-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id="tier-extended"
                  className="text-2xl font-semibold leading-8 text-orange-500"
                >
                  Extendida
                </h3>
                <p className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white dark:text-white">
                  Popular
                </p>
              </div>
              <p className="mt-4 text-base leading-6 text-gray-900 dark:text-gray-100">
                Cuota anual
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-2xl font-sans text-gray-500/70 line-through">
                  150€
                </span>
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  125€/mes
                </span>
              </p>
              <button
                type="button"
                aria-describedby="tier-extended"
                className="mt-6 block rounded-md bg-orange-500 px-3 py-2 text-center text-base font-medium leading-6 text-white shadow-sm hover:border-2 hover:border-amber-50 hover:bg-orange-800"
                onClick={() => handleCheckout("extendida")}
              >
                Paga ahora
              </button>
              <ul
                className="mt-8 space-y-3 text-sm leading-6 text-gray-900 dark:text-gray-100 xl:mt-10"
                role="list"
              >
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Asistencia remota premium <br />
                  (5h mensuales con cita, con prioridad en agenda)
                </li>
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  1 Plantilla de artículo configurable gratuita
                </li>
                <li className="flex gap-x-3 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="h-6 w-5 flex-none text-orange-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Respaldo de datos hasta 5 años por pago
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </>
  );
};

export default Tarifas;
