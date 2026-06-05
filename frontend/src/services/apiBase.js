// Aqui yo intento leer la variable de entorno VITE_API_URL (definida en el frontend).
// La uso sobre todo cuando trabajo en local y el backend corre en otro puerto o dominio.
// Con trim() elimino espacios al inicio/final para evitar URLs invalidas por error humano,
// por ejemplo: " http://localhost:8000 " -> "http://localhost:8000".
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Aqui yo calculo la URL base que usare en todas las llamadas HTTP del frontend.
// Lo hago dentro de una funcion autoejecutable para que se evalúe una sola vez
// al cargar el modulo y exportar directamente el valor final en API_URL.
export const API_URL = (() => {
  // Si NO estoy en modo DEV, asumo entorno de produccion.
  // En ese caso uso window.location.origin (mismo dominio/puerto/protocolo de la web actual).
  // Ejemplo: si la app abre en https://app.midominio.com,
  // API_URL sera https://app.midominio.com.
  // Esto simplifica despliegue detras de Nginx/reverse proxy con mismo host.
  if (!import.meta.env.DEV) {
    return window.location.origin;
  }

  // Si estoy en desarrollo y SI existe VITE_API_URL, priorizo ese valor.
  // Esto permite apuntar el frontend a un backend local/remoto concreto,
  // por ejemplo: http://localhost:8000 o https://api.staging.midominio.com.
  // Ademas quito una barra final para evitar dobles barras al concatenar rutas:
  // "http://localhost:8000/" + "/api/login" -> malo (//)
  // "http://localhost:8000" + "/api/login" -> correcto.
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  // Si estoy en desarrollo pero no defini VITE_API_URL,
  // uso el origen actual como fallback para que la app no se rompa.
  // Es una red de seguridad util cuando frontend y backend comparten host.
  return window.location.origin;
})();
