import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import FileInput from "./FileInput"; 

type Props = {
  mode: "create" | "edit";
  articuloId?: string;
};

type FormDataArticulo = {
  modelo: string;
  descripcion: string;
  medida: string;
  ancho: string;
  alto: string;
  kg: string;
  color: string;
  precio_m2: string;
  pvp_sin_iva: string;
  imagen: File | null;
  imagenUrl: string | null;
};

export function FormArticulo({ mode, articuloId }: Props): JSX.Element {
  const isEdit = mode === "edit";
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormDataArticulo>({
    modelo: "",
    descripcion: "",
    medida: "",
    ancho: "",
    alto: "",
    kg: "",
    color: "",
    precio_m2: "",
    pvp_sin_iva: "",
    imagen: null,
    imagenUrl: null,
  });

  /* ===============================
     🔹 Cargar artículo (editar)
  =============================== */
  useEffect(() => {
    if (isEdit && articuloId) {
      axios
        .get(`http://localhost:3001/articulos/${articuloId}`)
        .then((res) => {
          setFormData({
            modelo: res.data.modelo ?? "",
            descripcion: res.data.descripcion ?? "",
            medida: res.data.medida ?? "",
            ancho: res.data.ancho?.toString() ?? "",
            alto: res.data.alto?.toString() ?? "",
            kg: res.data.kg?.toString() ?? "",
            color: res.data.color ?? "",
            precio_m2: res.data.precio_m2?.toString() ?? "",
            pvp_sin_iva: res.data.pvp_sin_iva?.toString() ?? "",
            imagen: null,
            imagenUrl: res.data.imagen ?? null,
          });
        })
        .catch(() => alert("Error cargando artículo"));
    }
  }, [isEdit, articuloId]);

  /* ===============================
     🔹 Change handler
  =============================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===============================
     🔹 Submit
  =============================== */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Append solo los campos que tienen valor
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || key === "imagenUrl") return;

        if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, value.toString());
        }
      });

      if (isEdit && articuloId) {
        await axios.put(
          `http://localhost:3001/articulos/${articuloId}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Artículo actualizado");
      } else {
        await axios.post("http://localhost:3001/articulos", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Artículo creado");
      }

      navigate("/adminPanel/articulos");
    } catch (error) {
      console.error(error);
      alert("Error al guardar artículo");
    }
  };

  /* ===============================
     🔹 Render del formulario
  =============================== */
  return (
    <div className="container w-full mt-1">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto  p-8 rounded-md border dark:border-orange-500"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar artículo" : "Nuevo artículo"}
        </h2>

        {/* Inputs de texto */}
        {(
          [
            ["Modelo", "modelo"],
            ["Medida", "medida"],
            ["Color", "color"],
            ["Ancho", "ancho"],
            ["Alto", "alto"],
            ["Kg", "kg"],
            ["Precio m²", "precio_m2"],
            ["PVP sin IVA", "pvp_sin_iva"],
          ] as const
        ).map(([label, field]) => {
          const key = field as
            | "modelo"
            | "medida"
            | "color"
            | "ancho"
            | "alto"
            | "kg"
            | "precio_m2"
            | "pvp_sin_iva";

          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-bold mb-2">{label}</label>
              <input
                type="text"
                name={key}
                value={formData[key] ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-orange-500"
              />
            </div>
          );
        })}

        {/* Textarea para descripción */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500"
          />
        </div>

        {/* Imagen */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Imagen</label>
          <FileInput
            value={formData.imagen}
            ArticuloUrl={
              formData.imagenUrl
                ? `http://localhost:3001/uploads/articulos/${formData.imagenUrl}`
                : null
            }
            onChange={(imagen) =>
              setFormData((prev) => ({ ...prev, imagen }))
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md"
        >
          {isEdit ? "Guardar cambios" : "Crear artículo"}
        </button>
      </form>
    </div>
  );
}

export default FormArticulo;
