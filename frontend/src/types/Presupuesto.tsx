// src/types/Presupuestos.ts



export interface ItemPresupuesto {
  id: number;
  presupuesto_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}


export interface Presupuesto {
  id: number;
  numero_presupuesto: string;
  cliente_id: number;
  empleado_id: number;
  estado: "pendiente" | "aceptado" | "rechazado";
  fecha_creacion: string; // ISO string desde backend
  fecha_aceptacion?: string | null;
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
  items?: ItemPresupuesto[]; // opcional si tu API devuelve items
}