import { useEffect, useRef, useState } from "react";

const avatarDefault = "/ico_avatar_default.png";

// Componente de entrada de avatar con dos modos:
// 1) Subir archivo desde el equipo.
// 2) Capturar foto con la camara y convertirla a File.
export default function AvatarInput({ value, avatarUrl, onChange }) {
  // Referencias directas al DOM para trabajar con video/canvas.
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // URL de previsualizacion que se pinta en el <img> principal.
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);

  // Estado de camara y stream activo.
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);

  // Controla si el video ya esta listo para poder capturar.
  const [videoReady, setVideoReady] = useState(false);

  // Mensajes de error de camara para mostrarlos en UI.
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    // Si llega un File nuevo (subido o capturado), creamos URL temporal
    // para previsualizarlo antes de guardar.
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewUrl(avatarUrl || null);
    return undefined;
  }, [value, avatarUrl]);

  useEffect(() => {
    // Cuando hay stream, lo conectamos al elemento <video>.
    if (videoRef.current && stream) {
      try {
        // En Firefox puede lanzar DOMException si el stream ya no es valido.
        videoRef.current.srcObject = stream;
      } catch (error) {
        setCameraError(
          "No he podido conectar la camara con el video. Cierra y vuelve a abrir la camara.",
        );
        setVideoReady(false);
      }
    }
  }, [stream]);

  useEffect(() => {
    // Limpieza al desmontar: cerramos tracks para liberar camara.
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (event) => {
    // Tomamos solo el primer archivo y lo enviamos al componente padre.
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setVideoReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Este navegador no soporta acceso a camara. Usa Subir imagen.",
        );
        return;
      }

      // Pedimos acceso a camara frontal (ideal para avatar).
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch (error) {
      const errorName = error?.name || "";

      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        setCameraError(
          "No tengo permiso para usar la camara. Activalo en el navegador.",
        );
        return;
      }

      if (
        errorName === "NotFoundError" ||
        errorName === "DevicesNotFoundError"
      ) {
        setCameraError("No he encontrado ninguna camara en este dispositivo.");
        return;
      }

      if (errorName === "NotReadableError" || errorName === "TrackStartError") {
        setCameraError(
          "La camara esta en uso por otra aplicacion. Cierra esa app e intentalo de nuevo.",
        );
        return;
      }

      setCameraError(
        "No he podido abrir la camara. Revisa permisos del navegador o usa Subir imagen.",
      );
    }
  };

  const stopCamera = () => {
    // Desconecta el stream del video para evitar referencias colgadas.
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (error) {
        // Algunos navegadores lanzan error si el stream ya esta cerrado.
      }
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraOn(false);
    setVideoReady(false);
  };

  const takePhoto = () => {
    // Requiere video y canvas disponibles para capturar un frame.
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
      setCameraError(
        "La camara aun no esta lista. Espera un segundo y vuelve a capturar.",
      );
      return;
    }

    // Ajustamos canvas al tamano real del video para mantener calidad.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    try {
      // Copia del frame actual del video al canvas.
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      setCameraError(
        "No he podido capturar la foto. Vuelve a abrir la camara e intentalo otra vez.",
      );
      return;
    }

    // Convertimos el canvas a Blob y despues a File para reutilizar
    // el mismo flujo que "Subir imagen".
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("No he podido generar la imagen de la camara.");
          return;
        }

        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        onChange(file);
        setCameraError("");
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-orange-500 p-4 lg:flex-row lg:items-start">
      <div className="shrink-0">
        {/* Vista previa del avatar seleccionado; si no hay, icono por defecto */}
        <img
          src={previewUrl || avatarDefault}
          alt="Avatar"
          className="h-24 w-24 rounded-full border-2 border-gray-300 object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {!cameraOn ? (
          // Abre la camara para capturar.
          <button
            type="button"
            onClick={startCamera}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Tomar foto
          </button>
        ) : (
          <div className="flex gap-2">
            {/* Captura frame actual del video */}
            <button
              type="button"
              onClick={takePhoto}
              disabled={!videoReady}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Capturar
            </button>
            {/* Cierra camara sin capturar */}
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}

        <label
          htmlFor="avatarFile"
          className="cursor-pointer rounded-md border border-dashed border-gray-400 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Subir imagen
        </label>
        <input
          id="avatarFile"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {cameraOn && (
          // Vista en vivo de la camara.
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedData={() => {
              setVideoReady(true);
              setCameraError("");
            }}
            className="mt-1 h-44 w-60 rounded-md border object-cover"
          />
        )}

        {cameraError && <p className="text-sm text-red-500">{cameraError}</p>}
      </div>

      {/* Canvas oculto: se usa como buffer para extraer la foto del video */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
