import axios from "axios";

import { API_URL } from "./apiBase";

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

// Obtener tarifas efectivas (base + override empresa) de un configurable
export async function obtenerPricingArticuloConfigurable(id) {
  const res = await axios.get(`${BASE}/${id}/pricing`, {
    headers: headersJson(),
  });
  return res.data;
}

// Guardar precios por empresa para opciones de un configurable
export async function guardarPricingArticuloConfigurable(id, prices) {
  const res = await axios.put(
    `${BASE}/${id}/pricing`,
    { prices },
    { headers: headersJson() },
  );
  return res.data;
}
