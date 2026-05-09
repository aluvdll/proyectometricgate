export const Footer = () => {
  return (
    <>
      {/* Contenedor principal del Footer */}
      <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-2-screen-xl md:px-24 lg:px-8 bg-gray-700 text-white dark:text-white">
        {/* Grid de secciones del Footer */}
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* ===================================== */}
          {/* Sección de marca / descripción de la empresa */}
          {/* ===================================== */}
          <div className="sm:col-span-2">
            <a
              href="/"
              aria-label="Go home"
              title="Company"
              className="inline-flex items-center"
            >
              <span className="block text-2xl font-bold tracking-wide">
                <span className="text-orange-500">M</span>etric
                <span className="text-orange-500">G</span>ates
              </span>
            </a>

            {/* Descripción de la empresa */}
            <div className="mt-6 lg:max-w-sm">
              <p className="text-sm">
                MetricGates conecta tecnología y experiencia para el sector de
                la puerta automática, trabajando junto a instaladores y
                fabricantes para ofrecer soluciones innovadoras que aportan
                precisión, fiabilidad y optimización en cada proyecto, mejorando
                los procesos, aumentando la eficiencia y garantizando resultados
                profesionales.
              </p>
            </div>
          </div>

          {/* ===================================== */}
          {/* Sección de Contacto */}
          {/* ===================================== */}
          <div className=" space-y-2 text-sm">
            <p className="text-base font-bold tracking-wide text-orange-500">
              Contacto:
            </p>

            {/* Teléfono */}
            <div className="flex">
              <p className="mr-1 text-orange-500">Telefono:</p>
              <a
                href="tel:+34637141076"
                aria-label="Our phone"
                title="Our phone"
                className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
              >
                +34 637 14 10 76
              </a>
            </div>

            {/* Email */}
            <div className="flex">
              <p className="mr-1 text-orange-500">Email:</p>
              <a
                href="mailto:info@metricgates.com"
                aria-label="Our email"
                title="Our email"
                className="transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
              >
                info@metricgates.com
              </a>
            </div>

            {/* Dirección con icono */}
            <div className="flex">
              <p className="mr-1 text-orange-500">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
                </svg>
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Ramon+y+Cajal+1,+Villajoyosa,+Alicante,+España"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Our address"
                title="Our address"
                className="flex items-center transition-colors duration-300 text-deep-purple-accent-400 hover:text-deep-purple-800"
              >
                Ramon y Cajal 1, Alicante, España
              </a>
            </div>
          </div>

          {/* ===================================== */}
          {/* Sección Social / Redes sociales */}
          {/* ===================================== */}
          <div>
            <span className="text-base font-bold tracking-wide text-orange-500">
              Social
            </span>

            {/* Iconos de redes sociales */}
            <div className="flex items-center mt-1 space-x-3">
              {/* Twitter */}
              <a
                href="/"
                className=" text-gray-800 hover hover:text-orange-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                  <path d="M24,4.6c-0.9,0.4-1.8,0.7-2.8,0.8c1-0.6,1.8-1.6,2.2-2.7c-1,0.6-2,1-3.1,1.2c-0.9-1-2.2-1.6-3.6-1.6 c-2.7,0-4.9,2.2-4.9,4.9c0,0.4,0,0.8,0.1,1.1C7.7,8.1,4.1,6.1,1.7,3.1C1.2,3.9,1,4.7,1,5.6c0,1.7,0.9,3.2,2.2,4.1 C2.4,9.7,1.6,9.5,1,9.1c0,0,0,0,0,0.1c0,2.4,1.7,4.4,3.9,4.8c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.6,0-0.9-0.1c0.6,2,2.4,3.4,4.6,3.4 c-1.7,1.3-3.8,2.1-6.1,2.1c-0.4,0-0.8,0-1.2-0.1c2.2,1.4,4.8,2.2,7.5,2.2c9.1,0,14-7.5,14-14c0-0.2,0-0.4,0-0.6 C22.5,6.4,23.3,5.5,24,4.6z"></path>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="/"
                className=" text-gray-800 hover hover:text-orange-400"
              >
                <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                  <circle cx="15" cy="15" r="4"></circle>
                  <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z"></path>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="/"
                className=" text-gray-800 hover hover:text-orange-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                  <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2 V2C24,0.895,23.105,0,22,0z"></path>
                </svg>
              </a>
            </div>

            {/* Texto debajo de los iconos sociales */}
            <p className="mt-4 text-sm ">
              Síguenos en redes sociales y comparte nuestra pasión por la
              innovación en el sector de la puerta automática.
            </p>
          </div>
        </div>

        {/* ===================================== */}
        {/* Sección final / copyright y enlaces legales */}
        {/* ===================================== */}
        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © Copyright 2026 MetricGate. All rights reserved. || Diseñado por
            Vicente Devesa Llorens
          </p>

          {/* Enlaces legales */}
          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            <li>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-orange-800"
              >
                F.A.Q
              </a>
            </li>
            <li>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-orange-800"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-orange-800"
              >
                Terms &amp; Conditions
              </a>
            </li>
            <li>
              <a
                href="/politica-cookies"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-orange-800"
              >
                Politica de Cookies
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
