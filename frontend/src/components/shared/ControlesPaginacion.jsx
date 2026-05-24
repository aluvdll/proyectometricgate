export function ControlesPaginacion({
  paginaActual,
  ultimaPagina,
  totalRegistros,
  cargando = false,
  onCambiarPagina,
}) {
  // Aqui valido el cambio de pagina para no pedir paginas invalidas.
  const irAPagina = (pagina) => {
    if (cargando) return;
    if (pagina < 1 || pagina > ultimaPagina) return;
    onCambiarPagina(pagina);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-gray-600 dark:text-white">
        Pagina {paginaActual} de {ultimaPagina} · Total usuarios: {totalRegistros}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => irAPagina(paginaActual - 1)}
          disabled={cargando || paginaActual <= 1}
          className="rounded border border-orange-400 px-3 py-1 text-sm text-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={() => irAPagina(paginaActual + 1)}
          disabled={cargando || paginaActual >= ultimaPagina}
          className="rounded border border-orange-400 px-3 py-1 text-sm text-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}