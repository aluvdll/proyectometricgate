import { useParams } from "react-router-dom";
import { FormPresupuesto } from "../forms/FormPresupuesto.jsx";

export function VerEditarPresupuesto() {
  const { id } = useParams();

  if (!id) {
    return <div>Presupuesto no encontrado</div>;
  }

  return <FormPresupuesto mode="edit" presupuestoId={id} />;
}

export default VerEditarPresupuesto;
