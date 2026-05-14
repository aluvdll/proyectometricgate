import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BASE = `${API_URL}/api/company/orders`;

// Obtener token de sesión
function tokenSesion() {
  return localStorage.getItem("token");
}

// Headers HTTP estándar
function headersJson() {
  const token = tokenSesion();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// ╔════════════════════════════════════════════════════════════════╗
// ║ LISTAR PEDIDOS DE LA EMPRESA                                   ║
// ╚════════════════════════════════════════════════════════════════╝

export async function listarPedidos(status = null) {
  // status puede ser: 'pendiente', 'en_curso', 'finalizado' o null (todos)
  const url = status ? `${BASE}?status=${status}` : BASE;
  const res = await axios.get(url, { headers: headersJson() });
  return res.data.orders;
}

// ╔════════════════════════════════════════════════════════════════╗
// ║ VER DETALLE DE UN PEDIDO                                       ║
// ╚════════════════════════════════════════════════════════════════╝

export async function obtenerPedido(id) {
  const res = await axios.get(`${BASE}/${id}`, { headers: headersJson() });
  return res.data.order;
}

// ╔════════════════════════════════════════════════════════════════╗
// ║ ACTUALIZAR ESTADO DEL PEDIDO                                   ║
// ║ Estados: 'pendiente' → 'en_curso' → 'finalizado'              ║
// ╚════════════════════════════════════════════════════════════════╝

export async function actualizarEstadoPedido(
  id,
  nuevoEstado,
  fechaEntrega = null,
) {
  const payload = {
    status: nuevoEstado,
  };

  // Si se proporciona fecha de entrega, agregarla
  if (fechaEntrega) {
    payload.delivery_date = fechaEntrega;
  }

  const res = await axios.put(`${BASE}/${id}`, payload, {
    headers: headersJson(),
  });

  return res.data.order;
}
