// FormNuevoUsuario.tsx
import type { JSX } from "react";
import { FormCliente } from "./components/FormCliente.jsx";

export function FormNuevoCliente(): JSX.Element {
  return <FormCliente mode="create" clientId={null} />;
}
