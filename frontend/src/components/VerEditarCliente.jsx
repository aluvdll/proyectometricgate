import { useParams } from "react-router-dom";
import { FormCliente } from "./FormCliente";

export function VerEditarCliente() {
  const { id } = useParams();

  if (!id) return <div>Cliente no encontrado</div>;

  return <FormCliente mode="edit" clientId={id} />;
}
