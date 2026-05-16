export function PoliticaCookies() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 text-gray-800 dark:text-gray-100">
      <h1 className="mb-6 text-3xl font-bold">Política de Cookies</h1>

      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Última actualización: 9 de mayo de 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies y tecnologías similares son pequeños archivos que se almacenan en
          tu dispositivo para recordar información sobre tu sesión y preferencias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">2. ¿Qué usamos en MetricGate?</h2>
        <p className="mb-2">Actualmente utilizamos almacenamiento local del navegador para:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Guardar el token de sesión.</li>
          <li>Guardar información básica del usuario autenticado.</li>
          <li>Guardar el rol del usuario para controlar accesos.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">3. Finalidad</h2>
        <p>
          Estos datos se usan para mantener la sesión iniciada y permitir el
          funcionamiento del panel de administración de forma segura.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">4. Gestión de preferencias</h2>
        <p>
          Puedes eliminar estos datos desde la configuración de tu navegador.
          Si los eliminas, tendrás que iniciar sesión de nuevo.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">5. Contacto</h2>
        <p>
          Si tienes dudas sobre esta política, puedes contactar con el equipo de
          MetricGate a través de los canales de soporte habituales.
        </p>
      </section>
    </div>
  );
}

export default PoliticaCookies;
