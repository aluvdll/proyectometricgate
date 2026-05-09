import { useEffect, useRef, useState } from "react";
import type { AvatarInputProps } from "../types/AvatarInput";
import axios from "axios";

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

const AvatarInput: React.FC<AvatarInputProps> = ({
  value,
  onChange,
  avatarUrl,
  userId, // añadimos userId opcional para edición
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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
    if (userId) {
      const formData = new FormData();
      formData.append("avatar", compressed);
      try {
        const res = await axios.put(
          `http://localhost:3001/usuario/${userId}`,
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
      // Solo actualizar localmente si no hay userId (creación)
      onChange(compressed);
    }
  };

  /* ===============================
     📸 Encender cámara
  =============================== */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch (error) {
      console.error(error);
      alert("No se pudo acceder a la cámara");
    }
  };

  /* ===============================
     🧠 Asignar stream al video
  =============================== */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  /* ===============================
     ❌ Apagar cámara
  =============================== */
  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
  };

  /* ===============================
     🖼️ Tomar foto
  =============================== */
  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const MAX = 300;
    const scale = Math.min(MAX / video.videoWidth, MAX / video.videoHeight);

    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const compressed = await compressImage(file, 300, 0.7);

      if (userId) {
        // Subir al backend si es edición
        const formData = new FormData();
        formData.append("avatar", compressed);
        try {
          const res = await axios.put(
            `http://localhost:3001/usuario/${userId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          const uploadedUrl = res.data.avatar || URL.createObjectURL(compressed);
          onChange(compressed, uploadedUrl);
        } catch (err) {
          console.error(err);
          alert("Error al subir avatar");
        }
      } else {
        // Solo actualizar localmente si no hay userId
        onChange(compressed);
      }
    }, "image/jpeg", 0.7);

    stopCamera();
  };

  return (
    <div className="flex items-center gap-6 rounded-md border border-orange-500 p-4">
      {/* Avatar */}
      <div className="shrink-0">
        <img
          src={
            value
              ? URL.createObjectURL(value)
              : avatarUrl
              ? avatarUrl
              : avatarDef
          }
          alt="Avatar"
          className="h-28 w-28 rounded-full object-cover border-4 border-gray-300"
        />
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-3">
        {!cameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            📷 Tomar foto
          </button>
        ) : (
          <button
            type="button"
            onClick={takePhoto}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition"
          >
            ✅ Capturar
          </button>
        )}

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

      {/* Preview cámara */}
      {cameraOn && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-48 w-48 rounded-lg border"
        />
      )}

      {/* Canvas oculto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AvatarInput;
