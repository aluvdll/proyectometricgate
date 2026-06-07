import { API_URL } from "./apiBase";

const API_BASE = `${API_URL}/api/panel/superadmin/empresas`;

function crearHeaders(token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function urlAlternaLocal(url) {
  if (url.includes("127.0.0.1")) {
    return url.replace("127.0.0.1", "localhost");
  }

  if (url.includes("localhost")) {
    return url.replace("localhost", "127.0.0.1");
  }

  return null;
}

async function llamarApi(url, options) {
  let respuesta;

  try {
    respuesta = await fetch(url, options);
  } catch {
    const urlAlterna = urlAlternaLocal(url);

    if (urlAlterna) {
      try {
        respuesta = await fetch(urlAlterna, options);
      } catch {
        throw new Error(
          "No se pudo conectar con el servidor. Revisa que el backend esté encendido en el puerto 8000.",
        );
      }
    } else {
      throw new Error(
        "No se pudo conectar con el servidor. Revisa que el backend esté encendido en el puerto 8000.",
      );
    }
  }

  let data = null;
  try {
    const texto = await respuesta.text();
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = null;
  }

  if (!respuesta.ok) {
    const errorData = data && typeof data === "object" ? data : {};
    const mensajePorEstado = {
      401: "Sesión expirada o token inválido. Inicia sesion de nuevo.",
      403: "No tienes permisos para esta acción.",
      422: "Hay datos inválidos en el formulario.",
    };

    const mensaje =
      errorData.error ||
      errorData.message ||
      mensajePorEstado[respuesta.status] ||
      `Error en la solicitud (HTTP ${respuesta.status})`;

    throw new Error(mensaje);
  }

  return data;
}

function extraerListaEmpresas(respuesta) {
  if (Array.isArray(respuesta?.empresas)) {
    return respuesta.empresas;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  return [];
}

function extraerEmpresa(respuesta) {
  if (respuesta?.empresa) {
    return respuesta.empresa;
  }

  if (respuesta?.data) {
    return respuesta.data;
  }

  return null;
}

export async function obtenerEmpresas(token) {
  const respuesta = await llamarApi(API_BASE, {
    method: "GET",
    headers: crearHeaders(token),
  });

  return extraerListaEmpresas(respuesta);
}

export async function darAltaEmpresa(token, datos) {
  return llamarApi(`${API_BASE}/alta`, {
    method: "POST",
    headers: crearHeaders(token),
    body: JSON.stringify(datos),
  });
}

// Devuelve el detalle completo de una empresa para rellenar el formulario de edición.
export async function obtenerDetalleEmpresa(token, idEmpresa) {
  const respuesta = await llamarApi(`${API_BASE}/${idEmpresa}`, {
    method: "GET",
    headers: crearHeaders(token),
  });

  return extraerEmpresa(respuesta);
}

// Actualiza los datos básicos de empresa desde el panel de superadmin.
export async function actualizarEmpresa(token, idEmpresa, datos) {
  const respuesta = await llamarApi(`${API_BASE}/${idEmpresa}`, {
    method: "PUT",
    headers: crearHeaders(token),
    body: JSON.stringify(datos),
  });

  return extraerEmpresa(respuesta);
}

export async function darBajaEmpresa(token, idEmpresa) {
  return llamarApi(`${API_BASE}/${idEmpresa}/baja`, {
    method: "PATCH",
    headers: crearHeaders(token),
    body: JSON.stringify({}),
  });
}

export async function reactivarEmpresa(token, idEmpresa) {
  return llamarApi(`${API_BASE}/${idEmpresa}/reactivar`, {
    method: "PATCH",
    headers: crearHeaders(token),
    body: JSON.stringify({}),
  });
}

export async function obtenerUsuariosEmpresa(token, idEmpresa) {
  const respuesta = await llamarApi(
    `${API_URL}/api/users?company_id=${encodeURIComponent(idEmpresa)}&per_page=200`,
    {
      method: "GET",
      headers: crearHeaders(token),
    },
  );

  return respuesta?.data || [];
}
