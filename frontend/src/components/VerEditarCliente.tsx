// VerEditarUsuario.tsx
import type { JSX } from "react";
import { useParams } from "react-router-dom";
import { FormCliente } from "./FormCliente";

export function VerEditarCliente(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Cliente no encontrado</div>; 
  return <FormCliente mode="edit" userId={id} />;
}
