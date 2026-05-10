import { useParams } from "react-router-dom";
import { FormFamiliaArticulo } from "./FormFamiliaArticulo.jsx";

export function VerEditarFamiliaArticulo() {
  const { id } = useParams();

  if (!id) {
    return <div>Familia no encontrada</div>;
  }

  return <FormFamiliaArticulo mode="edit" familiaId={id} />;
}

export default VerEditarFamiliaArticulo;
