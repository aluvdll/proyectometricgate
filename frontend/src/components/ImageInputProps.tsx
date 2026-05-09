import { useMemo, useEffect } from "react";
import type { ImageInputProps } from "../types/FileInput";

const ImageInput: React.FC<ImageInputProps> = ({
  value,
  onChange,
  imageUrl,
  label = "Imagen",
  maxPreviewSize = 300,
}) => {
  const preview = useMemo(() => {
    if (value) {
      return URL.createObjectURL(value);
    }
    return imageUrl ?? null;
  }, [value, imageUrl]);

  // cleanup del objectURL
  useEffect(() => {
    return () => {
      if (preview && value) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-bold mb-1">{label}</label>

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mb-2 border rounded"
          style={{ maxWidth: maxPreviewSize, maxHeight: maxPreviewSize }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="rounded border border-gray-300 p-1"
      />
    </div>
  );
};

export default ImageInput;
