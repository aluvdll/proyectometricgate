import { useParams } from "react-router-dom";
import { FormArticulo } from "./FormArticulo.jsx";

export function VerEditarArticulo() {
  const { id } = useParams();

  if (!id) {
    return <div>Artículo no encontrado</div>;
  }

  return <FormArticulo mode="edit" articuloId={id} />;
}

export default VerEditarArticulo;
