// Tipo para los items que vienen del backend
export type ItemBackend = {
  id: number;
  presupuesto_id: number;
  articulo_id: number;
  cantidad: string;        // viene como string
  ancho: number | null;
  alto: number | null;
  precio_unitario: string; // viene como string
  total_linea: string;     // viene como string
  descripcion?: string;   // opcional, si el backend lo proporciona
};