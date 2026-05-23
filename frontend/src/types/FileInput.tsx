export type ImageInputProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  imageUrl?: string | null;
  label?: string;
  maxPreviewSize?: number; // opcional, tamaño máximo de preview
};