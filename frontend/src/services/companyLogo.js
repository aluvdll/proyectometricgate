import { API_URL } from "./apiBase";

function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders(accept = "application/json") {
  const token = getToken();

  return {
    Accept: accept,
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo transformar el logo a data URL."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer el logo."));
    reader.readAsDataURL(blob);
  });
}

export async function obtenerLogoEmpresaDataUrl() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/company/logo?v=${Date.now()}`, {
      method: "GET",
      headers: authHeaders("image/*"),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const logoBlob = await response.blob();

    if (!logoBlob || logoBlob.size === 0) {
      return null;
    }

    return await blobToDataUrl(logoBlob);
  } catch (_error) {
    return null;
  }
}

export async function obtenerDatosEmpresaImpresion() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/company/print-info`, {
      method: "GET",
      headers: authHeaders("application/json"),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.company || null;
  } catch (_error) {
    return null;
  }
}
