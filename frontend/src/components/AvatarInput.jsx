import { useEffect, useRef, useState } from "react";

const avatarDefault = "/ico_avatar_default.png";

export default function AvatarInput({ value, avatarUrl, onChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
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
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraOn(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        onChange(file);
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-orange-500 p-4 lg:flex-row lg:items-start">
      <div className="shrink-0">
        <img
          src={previewUrl || avatarDefault}
          alt="Avatar"
          className="h-24 w-24 rounded-full border-2 border-gray-300 object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {!cameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Tomar foto
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={takePhoto}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              Capturar
            </button>
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="mt-1 h-44 w-60 rounded-md border object-cover"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
