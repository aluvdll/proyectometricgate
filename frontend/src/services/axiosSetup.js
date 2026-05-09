import axios from "axios";

const LAST_ACTIVITY_KEY = "last_activity";

// REQUEST INTERCEPTOR
// Se ejecuta antes de cada petición al backend.
// Actualiza last_activity con la hora actual.
axios.interceptors.request.use((config) => {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  return config;
});

// RESPONSE INTERCEPTOR
// Se ejecuta cuando llega la respuesta del backend.
// Si el servidor responde 401 (token inválido/expirado),
// lanza un evento global para que AuthContext cierre la sesión.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  },
);
