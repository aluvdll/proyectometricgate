// VerEditarUsuario.tsx
import type { JSX } from "react";
import { useParams } from "react-router-dom";
import { FormPresupuesto } from "./FormPresupuesto";


export function VerEditarPresupuesto(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Presupuesto no encontrado</div>;

  return <FormPresupuesto mode="edit" presupuestoId={id} />;
}
