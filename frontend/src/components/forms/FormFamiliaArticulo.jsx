import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [formData, setFormData] = useState(valoresIniciales);
  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

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
        setFormData({
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
  }, [isEdit, familiaId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification(
        "Error",
        "El nombre de la familia es obligatorio.",
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        active: formData.active,
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
        onSubmit={handleSubmit}
        className="w-full mx-auto rounded-md border border-orange-500 p-8"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar familia" : "Nueva familia"}
        </h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
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
