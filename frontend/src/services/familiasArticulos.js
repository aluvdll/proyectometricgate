import axios from "axios";

import { API_URL } from "./apiBase";

const API_BASE = `${API_URL}/api/company/article-families`;

function tokenSesion() {
  return localStorage.getItem("token");
}

function headersJson() {
  const token = tokenSesion();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function construirErrorApi(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const mensaje =
      data?.error ||
      data?.message ||
      (error.response?.status === 401
        ? "Sesion expirada o token invalido."
        : error.response?.status === 403
          ? "No tienes permisos para esta accion."
          : error.response?.status === 422
            ? "Hay datos invalidos en el formulario."
            : error.message || "Error inesperado en la peticion");

    const apiError = new Error(mensaje);
    if (data?.errors && typeof data.errors === "object") {
      apiError.fieldErrors = data.errors;
    }
    apiError.status = error.response?.status;
    return apiError;
  }

  return new Error("Error inesperado");
}

export async function obtenerFamiliasArticulosEmpresa() {
  try {
    const response = await axios.get(API_BASE, {
      headers: headersJson(),
    });
    return response.data.families || [];
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function obtenerFamiliaArticuloEmpresa(id) {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, {
      headers: headersJson(),
    });
    return response.data.family;
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function crearFamiliaArticuloEmpresa(payload) {
  try {
    const response = await axios.post(API_BASE, payload, {
      headers: headersJson(),
    });
    return response.data.family;
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function actualizarFamiliaArticuloEmpresa(id, payload) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, payload, {
      headers: headersJson(),
    });
    return response.data.family;
  } catch (error) {
    throw construirErrorApi(error);
  }
}
