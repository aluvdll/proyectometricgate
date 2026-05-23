import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/hero2.jpg";
import logoMetricGate from "/fav_icon_metricGates.svg";
import { FloatingWhatsApp } from "react-floating-whatsapp";

export function Hero() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      setIsDarkMode(mediaQuery.matches);
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  return (
    <>
      {/* <!-- Section 2 --> */}
      <section className="px-2 py-32 dark:text-gray-300  md:px-0">
        <div className="container items-center max-w-6xl px-8 mx-auto xl:px-5">
          <div className="flex flex-wrap items-center sm:-mx-3">
            <div className="w-full md:w-1/2 md:px-3">
              <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                <h1 className="text-4xl font-extrabold tracking-tight  sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                  <span className="block xl:inline">
                    La herramienta que te ayuda abrir más
                  </span>
                  <span className="block text-orange-500 xl:inline">
                    {" "}
                    rápido
                  </span>
                </h1>
                <p className="mx-auto text-base sm:max-w-md lg:text-xl md:max-w-3xl">
                  Nunca ha sido tan fácil crear puertas hermosas desde la palma
                  de tu mano.
                </p>
                <div className="relative flex flex-col sm:flex-row sm:space-x-4">
                  <Link
                    to="/tarifas"
                    className="flex items-center w-full px-6 py-3 mb-3 text-lg text-white hover:text-orange-500 bg-orange-500 rounded-md sm:mb-0 hover:bg-orange-200 sm:w-auto hover:border-orange-500  dark:border:orange-500  dark:hover:text-orange-500 justify-center"
                  >
                    Tarifas
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                  <Link
                    to="/contacto"
                    className="
    flex items-center px-6 py-3 text-lg text-orange-500 dark:text-white border hover:bg-orange-500 border-orange-500 dark:hover:bg-gray-200 hover:text-white rounded-md w-full sm:w-auto justify-center "
                  >
                    Contacto
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-full h-auto rounded-lg shadow-xl sm:rounded-lg">
                <img className="rounded-lg" src={heroImg} alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FloatingWhatsApp
        phoneNumber="637141076"
        accountName="MetricGate"
        avatar={logoMetricGate}
        statusMessage="¡Hola! ¿En qué puedo ayudarte?"
        chatMessage="¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?"
        darkMode={isDarkMode}
        allowClickAway
        allowEsc
        className="metricgate-whatsapp"
      />
      <style>{`
        .metricgate-whatsapp .styles-module_chatFooter__TGv0P form .styles-module_input__WFb9L {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
        }

        .metricgate-whatsapp .styles-module_chatFooter__TGv0P form .styles-module_input__WFb9L::placeholder {
          color: #6b7280 !important;
        }

        .metricgate-whatsapp.styles-module_dark__iZs3I .styles-module_chatFooter__TGv0P form .styles-module_input__WFb9L {
          color: #f1f1f2 !important;
          -webkit-text-fill-color: #f1f1f2 !important;
        }

        .metricgate-whatsapp.styles-module_dark__iZs3I .styles-module_chatFooter__TGv0P form .styles-module_input__WFb9L::placeholder {
          color: #b7c0c4 !important;
        }
      `}</style>
    </>
  );
}
