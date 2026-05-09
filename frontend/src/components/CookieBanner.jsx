import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "cookies_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);

    if (!savedConsent) {
      setVisible(true);
    }
  }, []);

  const guardarConsentimiento = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-300 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-orange-500 dark:bg-gray-900/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-800 dark:text-gray-100">
          Utilizamos cookies y almacenamiento local para mejorar tu experiencia.
          Puedes consultar los detalles en la{" "}
          <Link
            to="/politica-cookies"
            className="font-semibold text-orange-600 underline hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
          >
            política de cookies
          </Link>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => guardarConsentimiento("rejected")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Rechazar
          </button>

          <button
            type="button"
            onClick={() => guardarConsentimiento("accepted")}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
