
import axios from "axios";
import type { ArticuloInputProps } from "../types/Articulo";
const avatarDef = "/ico_avatar_default.png";


/* ===============================
   🗜️ Compresión de imagen
================================ */
const compressImage = (
  file: File,
  maxSize = 300,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas error");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Blob error");
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = reject;
    img.src = url;
  });
};

const FileInput: React.FC<ArticuloInputProps> = ({
  value,
  onChange,
  ArticuloUrl,
  articuloId, // añadimos articuloId opcional para edición
}) => {

  /* ===============================
     📁 Subir imagen desde archivo
  =============================== */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file, 300, 0.7);

    // Subir directamente al backend si es edición
    if (articuloId) {
      const formData = new FormData();
      formData.append("avatar", compressed);
      try {
        const res = await axios.put(
          `http://localhost:3001/articulo/${articuloId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        // El backend devuelve el usuario actualizado o podemos construir la URL
        const uploadedUrl = res.data.avatar || URL.createObjectURL(compressed);
        onChange(compressed, uploadedUrl);
      } catch (err) {
        console.error(err);
        alert("Error al subir avatar");
      }
    } else {
      // Solo actualizar localmente si no hay articuloId (creación)
      onChange(compressed);
    }
  };








  return (
    <div className="flex items-center gap-6 rounded-md border border-orange-500 p-4">
      {/* Avatar */}
      <div className="shrink-0">
        <img
          src={
            value
              ? URL.createObjectURL(value)
              : ArticuloUrl
              ? ArticuloUrl
              : avatarDef
          }
          alt="Avatar"
          className="h-28 w-28 rounded-full object-cover border-4 border-gray-300"
        />
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-3">
      

        <label
          htmlFor="fileInput"
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-400 px-4 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          ⬆ Subir imagen
        </label>

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </div>

 

  
    </div>
  );
};

export default FileInput;
