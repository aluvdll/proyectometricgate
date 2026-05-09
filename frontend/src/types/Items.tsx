export type Item = {
  articulo_id: string; // id del artículo seleccionado
  descripcion: string; // solo para mostrar en el input
  cantidad: number;
  ancho?: number | null;
  alto?: number | null;
  precio_unitario: number;
};

