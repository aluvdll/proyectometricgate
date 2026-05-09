import type { AltaEmpresaPayload, Empresa } from "../types/Empresa";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE = `${API_URL}/api/panel/superadmin/empresas`;

function crearHeaders(token: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function urlAlternaLocal(url: string): string | null {
  if (url.includes("127.0.0.1")) {
    return url.replace("127.0.0.1", "localhost");
  }

  if (url.includes("localhost")) {
    return url.replace("localhost", "127.0.0.1");
  }

  return null;
}

async function llamarApi<T>(url: string, options: RequestInit): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(url, options);
  } catch {
    const urlAlterna = urlAlternaLocal(url);

    if (urlAlterna) {
      try {
        respuesta = await fetch(urlAlterna, options);
      } catch {
        throw new Error(
          "No se pudo conectar con el servidor. Revisa que el backend este encendido en el puerto 8000.",
        );
      }
    } else {
      throw new Error(
        "No se pudo conectar con el servidor. Revisa que el backend este encendido en el puerto 8000.",
      );
    }
  }

  let data: unknown = null;
  try {
    const texto = await respuesta.text();
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = null;
  }

  if (!respuesta.ok) {
    const errorData =
      data && typeof data === "object"
        ? (data as { error?: string; message?: string })
        : {};
    const mensajePorEstado: Record<number, string> = {
      401: "Sesion expirada o token invalido. Inicia sesion de nuevo.",
      403: "No tienes permisos para esta accion.",
      422: "Hay datos invalidos en el formulario.",
    };

    const mensaje =
      errorData.error ||
      errorData.message ||
      mensajePorEstado[respuesta.status] ||
      `Error en la solicitud (HTTP ${respuesta.status})`;

    throw new Error(mensaje);
  }

  return data as T;
}

export async function obtenerEmpresas(token: string): Promise<Empresa[]> {
  const respuesta = await llamarApi<{ empresas: Empresa[] }>(API_BASE, {
    method: "GET",
    headers: crearHeaders(token),
  });

  return respuesta.empresas;
}

export async function darAltaEmpresa(token: string, datos: AltaEmpresaPayload) {
  return llamarApi(`${API_BASE}/alta`, {
    method: "POST",
    headers: crearHeaders(token),
    body: JSON.stringify(datos),
  });
}

export async function darBajaEmpresa(token: string, idEmpresa: number) {
  return llamarApi(`${API_BASE}/${idEmpresa}/baja`, {
    method: "PATCH",
    headers: crearHeaders(token),
    body: JSON.stringify({}),
  });
}

export async function reactivarEmpresa(token: string, idEmpresa: number) {
  return llamarApi(`${API_BASE}/${idEmpresa}/reactivar`, {
    method: "PATCH",
    headers: crearHeaders(token),
    body: JSON.stringify({}),
  });
}
