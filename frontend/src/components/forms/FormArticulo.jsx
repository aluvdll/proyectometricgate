import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NotificationModal } from "../modals/NotificationModal";
import { obtenerFamiliasArticulosEmpresa } from "../../services/familiasArticulos";
import {
  actualizarArticuloEmpresa,
  crearArticuloEmpresa,
  obtenerArticuloEmpresa,
} from "../../services/articulos";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

  const [formData, setFormData] = useState(valoresIniciales);
  const [familias, setFamilias] = useState([]);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(null);
  const [loadingArticulo, setLoadingArticulo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

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
        setFormData({
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
  }, [isEdit, articuloId]);

  useEffect(() => {
    return () => {
      if (imagenFile instanceof File) {
        URL.revokeObjectURL(previewImagen);
      }
    };
  }, [imagenFile, previewImagen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!esAdmin) {
      showNotification(
        "Error",
        "Solo admin puede crear o editar artículos.",
        "error",
      );
      return;
    }

    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.base_price
    ) {
      showNotification(
        "Error",
        "Completa código, nombre y precio base.",
        "error",
      );
      return;
    }

    const data = new FormData();
    if (formData.family_id) {
      data.append("family_id", formData.family_id);
    }
    data.append("code", formData.code.trim());
    data.append("name", formData.name.trim());
    data.append("description", formData.description?.trim() || "");
    data.append("base_price", formData.base_price);
    data.append("tax_percentage", formData.tax_percentage || "21");
    data.append("active", formData.active ? "1" : "0");

    if (imagenFile) {
      data.append("image", imagenFile);
    }

    setSaving(true);
    try {
      if (isEdit && articuloId) {
        await actualizarArticuloEmpresa(articuloId, data);
        showNotification("Éxito", "Artículo actualizado", "success");
      } else {
        await crearArticuloEmpresa(data);
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
        onSubmit={handleSubmit}
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
            name="family_id"
            value={formData.family_id}
            onChange={handleChange}
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
            name="code"
            value={formData.code}
            onChange={handleChange}
            disabled={!esAdmin}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!esAdmin}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
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
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              disabled={!esAdmin}
              className="w-full rounded-md border border-orange-500 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">IVA (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="tax_percentage"
              value={formData.tax_percentage}
              onChange={handleChange}
              disabled={!esAdmin}
              className="w-full rounded-md border border-orange-500 px-3 py-2"
            />
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
            name="active"
            checked={formData.active}
            onChange={handleChange}
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
