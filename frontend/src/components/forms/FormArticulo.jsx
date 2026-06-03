import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NotificationModal } from "../modals/NotificationModal";
import { obtenerFamiliasArticulosEmpresa } from "../../services/familiasArticulos";
import {
  actualizarArticuloEmpresa,
  crearArticuloEmpresa,
  obtenerArticuloEmpresa,
} from "../../services/articulos";

import { API_URL } from "../../services/apiBase";

const valoresIniciales = {
  family_id: "",
  code: "",
  name: "",
  description: "",
  base_price: "",
  tax_percentage: "21",
  active: true,
};

export function FormArticulo({ mode, articuloId = undefined }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = mode === "edit";
  const esAdmin = user?.role === "admin";

  const [familias, setFamilias] = useState([]);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(null);
  const [loadingArticulo, setLoadingArticulo] = useState(false);
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
    // Con watch puedo leer valores en vivo si necesito reaccionar a cambios.
    watch,
    // Aqui leo los errores por campo para pintar los mensajes debajo del input.
    formState: { errors },
  } = useForm({
    defaultValues: valoresIniciales,
  });

  const previewImagen = useMemo(() => {
    if (imagenFile instanceof File) {
      return URL.createObjectURL(imagenFile);
    }
    return imagenUrl;
  }, [imagenFile, imagenUrl]);

  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 2500);
  };

  useEffect(() => {
    obtenerFamiliasArticulosEmpresa()
      .then((data) => setFamilias(data))
      .catch(() => {
        // Si falla, el artículo sigue pudiendo guardarse sin familia.
      });
  }, []);

  useEffect(() => {
    if (!isEdit || !articuloId) {
      return;
    }

    setLoadingArticulo(true);
    obtenerArticuloEmpresa(articuloId)
      .then((articulo) => {
        // En modo edicion vuelco los datos del articulo al formulario con reset.
        reset({
          family_id: articulo.family_id?.toString() ?? "",
          code: articulo.code ?? "",
          name: articulo.name ?? "",
          description: articulo.description ?? "",
          base_price: articulo.base_price?.toString() ?? "",
          tax_percentage: articulo.tax_percentage?.toString() ?? "21",
          active: Boolean(articulo.active),
        });
        setImagenFile(null);
        setImagenUrl(
          articulo.image ? `${API_URL}/storage/${articulo.image}` : null,
        );
      })
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando artículo",
          "error",
        );
      })
      .finally(() => {
        setLoadingArticulo(false);
      });
  }, [isEdit, articuloId, reset]);

  useEffect(() => {
    return () => {
      if (imagenFile instanceof File) {
        URL.revokeObjectURL(previewImagen);
      }
    };
  }, [imagenFile, previewImagen]);

  // Este metodo solo se ejecuta si React Hook Form valida bien todos los campos.
  const onSubmit = async (data) => {
    if (!esAdmin) {
      showNotification(
        "Error",
        "Solo admin puede crear o editar artículos.",
        "error",
      );
      return;
    }

    const payload = new FormData();
    if (data.family_id) {
      payload.append("family_id", data.family_id);
    }
    payload.append("code", data.code.trim());
    payload.append("name", data.name.trim());
    payload.append("description", data.description?.trim() || "");
    payload.append("base_price", data.base_price);
    payload.append("tax_percentage", data.tax_percentage || "21");
    payload.append("active", data.active ? "1" : "0");

    if (imagenFile) {
      payload.append("image", imagenFile);
    }

    setSaving(true);
    try {
      if (isEdit && articuloId) {
        await actualizarArticuloEmpresa(articuloId, payload);
        showNotification("Éxito", "Artículo actualizado", "success");
      } else {
        await crearArticuloEmpresa(payload);
        showNotification("Éxito", "Artículo creado", "success");
      }

      setTimeout(() => navigate("/adminPanel/articulos"), 2500);
    } catch (error) {
      const mensaje = error?.fieldErrors
        ? Object.values(error.fieldErrors).flat().join("\n")
        : error.message || "Error al guardar artículo";

      showNotification("Error", mensaje, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingArticulo) {
    return <div className="container w-full mt-1">Cargando artículo...</div>;
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
          {isEdit ? "Editar artículo" : "Nuevo artículo"}
        </h2>

        {!esAdmin && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Solo admin puede crear o editar artículos. Puedes consultar los
            datos.
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Familia</label>
          <select
            {...register("family_id")}
            disabled={!esAdmin}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          >
            <option value="">Sin familia</option>
            {familias.map((familia) => (
              <option key={familia.id} value={familia.id}>
                {familia.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            El artículo puede pertenecer a una familia o no.
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Código</label>
          <input
            type="text"
            // Aqui registro el input y defino sus reglas de validacion.
            {...register("code", {
              required: "El código es obligatorio.",
            })}
            disabled={!esAdmin}
            className={`w-full rounded-md px-3 py-2 ${errors.code ? "border border-red-500" : "border border-orange-500"}`}
          />
          {/* Si este campo falla, aqui muestro su mensaje de error */}
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Nombre</label>
          <input
            type="text"
            {...register("name", {
              required: "El nombre es obligatorio.",
            })}
            disabled={!esAdmin}
            className={`w-full rounded-md px-3 py-2 ${errors.name ? "border border-red-500" : "border border-orange-500"}`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            {...register("description")}
            disabled={!esAdmin}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">
              Precio base (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("base_price", {
                required: "El precio base es obligatorio.",
              })}
              disabled={!esAdmin}
              className={`w-full rounded-md px-3 py-2 ${errors.base_price ? "border border-red-500" : "border border-orange-500"}`}
            />
            {errors.base_price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.base_price.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">IVA (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("tax_percentage", {
                required: "El IVA es obligatorio.",
              })}
              disabled={!esAdmin}
              className={`w-full rounded-md px-3 py-2 ${errors.tax_percentage ? "border border-red-500" : "border border-orange-500"}`}
            />
            {errors.tax_percentage && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tax_percentage.message}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
            disabled={!esAdmin}
            className="w-full text-sm"
          />
          {previewImagen && (
            <img
              src={previewImagen}
              alt="Previsualización artículo"
              className="mt-3 h-24 w-24 rounded border object-cover"
            />
          )}
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            // Tambien registro checkboxes para que formen parte del submit.
            {...register("active")}
            disabled={!esAdmin}
            className="h-4 w-4"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Artículo activo
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || !esAdmin}
          className="w-full rounded-md bg-orange-500 py-2 text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear artículo"}
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

export default FormArticulo;
