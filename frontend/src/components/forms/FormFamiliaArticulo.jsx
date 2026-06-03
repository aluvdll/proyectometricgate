import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { NotificationModal } from "../modals/NotificationModal";
import {
  actualizarFamiliaArticuloEmpresa,
  crearFamiliaArticuloEmpresa,
  obtenerFamiliaArticuloEmpresa,
} from "../../services/familiasArticulos";

const valoresIniciales = {
  name: "",
  description: "",
  active: true,
};

export function FormFamiliaArticulo({ mode, familiaId = undefined }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  // Aqui inicializo React Hook Form con los valores por defecto de mi formulario.
  const {
    // Con register conecto cada input al estado interno del formulario.
    register,
    // Con handleSubmit valido todo y solo si pasa ejecuto onSubmit.
    handleSubmit,
    // Con reset relleno o limpio el formulario de una sola vez.
    reset,
    // Aqui leo los errores por campo para pintar los mensajes debajo del input.
    formState: { errors },
  } = useForm({
    defaultValues: valoresIniciales,
  });

  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 2500);
  };

  useEffect(() => {
    if (!isEdit || !familiaId) {
      return;
    }

    setLoadingFamilia(true);
    obtenerFamiliaArticuloEmpresa(familiaId)
      .then((familia) => {
        // En modo edicion vuelco los datos de la familia al formulario con reset.
        reset({
          name: familia.name ?? "",
          description: familia.description ?? "",
          active: Boolean(familia.active),
        });
      })
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando familia",
          "error",
        );
      })
      .finally(() => setLoadingFamilia(false));
  }, [isEdit, familiaId, reset]);

  // Este metodo solo se ejecuta si React Hook Form valida bien todos los campos.
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        active: data.active,
      };

      if (isEdit && familiaId) {
        await actualizarFamiliaArticuloEmpresa(familiaId, payload);
        showNotification("Éxito", "Familia actualizada", "success");
      } else {
        await crearFamiliaArticuloEmpresa(payload);
        showNotification("Éxito", "Familia creada", "success");
      }

      setTimeout(() => navigate("/adminPanel/familias"), 2500);
    } catch (error) {
      const mensaje = error?.fieldErrors
        ? Object.values(error.fieldErrors).flat().join("\n")
        : error.message || "Error al guardar familia";

      showNotification("Error", mensaje, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingFamilia) {
    return <div className="container w-full mt-1">Cargando familia...</div>;
  }

  return (
    <div className="container w-full mt-1">
      <form
        // Paso onSubmit por handleSubmit para que React Hook Form controle la validacion.
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full mx-auto rounded-md border border-orange-500 p-8"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar familia" : "Nueva familia"}
        </h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Nombre</label>
          <input
            type="text"
            // Aqui registro el input y defino sus reglas de validacion.
            {...register("name", {
              required: "El nombre de la familia es obligatorio.",
              maxLength: {
                value: 255,
                message: "El nombre no puede superar 255 caracteres.",
              },
            })}
            className={`w-full rounded-md px-3 py-2 ${errors.name ? "border border-red-500" : "border border-orange-500"}`}
          />
          {/* Si este campo falla, aqui muestro su mensaje de error */}
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            {...register("description")}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            // Tambien registro checkboxes para que formen parte del submit.
            {...register("active")}
            className="h-4 w-4"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Familia activa
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-orange-500 py-2 text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear familia"}
        </button>
      </form>

      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </div>
  );
}

export default FormFamiliaArticulo;
