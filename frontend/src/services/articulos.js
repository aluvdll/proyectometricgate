import axios from "axios";

import { API_URL } from "./apiBase";

const API_BASE = `${API_URL}/api/company/articles`;

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

function headersMultipart() {
  const token = tokenSesion();
  return {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function extraerMensajeError(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error.response?.status === 401)
      return "Sesion expirada o token invalido.";
    if (error.response?.status === 403)
      return "No tienes permisos para esta accion.";
    if (error.response?.status === 422)
      return "Hay datos invalidos en el formulario.";
    return error.message || "Error inesperado en la peticion";
  }

  return "Error inesperado";
}

function construirErrorApi(error) {
  const mensaje = extraerMensajeError(error);
  const apiError = new Error(mensaje);

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors && typeof data.errors === "object") {
      apiError.fieldErrors = data.errors;
    }
    apiError.status = error.response?.status;
  }

  return apiError;
}

export async function obtenerArticulosEmpresa() {
  try {
    const response = await axios.get(API_BASE, {
      headers: headersJson(),
    });
    return response.data.articles || [];
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function obtenerArticuloEmpresa(id) {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, {
      headers: headersJson(),
    });
    return response.data.article;
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function crearArticuloEmpresa(formData) {
  try {
    const response = await axios.post(API_BASE, formData, {
      headers: headersMultipart(),
    });
    return response.data.article;
  } catch (error) {
    throw construirErrorApi(error);
  }
}

export async function actualizarArticuloEmpresa(id, formData) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, formData, {
      headers: headersMultipart(),
    });
    return response.data.article;
  } catch (error) {
    throw construirErrorApi(error);
  }
}
