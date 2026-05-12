import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BASE = `${API_URL}/api/company/configurable-articles`;

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

// Listado de artículos configurables de la empresa
export async function listarArticulosConfigurables() {
  const res = await axios.get(BASE, { headers: headersJson() });
  return res.data;
}

// Detalle de un artículo: partes, opciones y reglas
export async function obtenerArticuloConfigurable(id) {
  const res = await axios.get(`${BASE}/${id}`, { headers: headersJson() });
  return res.data;
}

// Validar medidas y calcular precio desglosado
export async function calcularArticuloConfigurable(id, payload) {
  const res = await axios.post(`${BASE}/${id}/calculate`, payload, {
    headers: headersJson(),
  });
  return res.data;
}
