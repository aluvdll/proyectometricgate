export type Articulo = {
  id_articulo: number;
  modelo: string;
  descripcion: string;
  medida: string;
  ancho: number | null;
  alto: number | null;
  kg: number | null;
  color: string;
  precio_m2: number | null;
  pvp_sin_iva: number | null;
  imagen: string | null;
  cantidad: number;
};

export type ArticuloInputProps = {
  value: File | null;
  onChange: (articulo: File, ArticuloUrl?: string) => void;
  ArticuloUrl?: string | null;
  articuloId?: string; // opcional para edición

}

// export type AvatarInputProps = {
//   value: File |null;
//   onChange: (avatar: File, avatarUrl?: string) => void;
//   avatarUrl?: string | null;
//     userId?: string; // opcional para edición
// };