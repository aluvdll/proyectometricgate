const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL = (() => {
  if (!import.meta.env.DEV) {
    return window.location.origin;
  }

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  return window.location.origin;
})();
