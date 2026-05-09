// VerEditarArticulo.tsx

import type { JSX } from "react";
import { useParams } from "react-router-dom";
import { FormArticulo } from "./FormArticulo";

export function VerEditarArticulo(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Articulo no encontrado</div>;

  return <FormArticulo mode="edit" articuloId={id} />;
}