import { useParams } from "react-router-dom";
import { FormUsuario } from "./FormUsuario";

export function VerEditarUsuario() {
  const { id } = useParams();
  if (!id) return <div>Usuario no encontrado</div>;

  return <FormUsuario mode="edit" userId={id} />;
}
