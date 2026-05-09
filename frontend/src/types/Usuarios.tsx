// Definimos la estructura que tendrá el objeto usuario según el backend
export interface Usuario {
  id: number;
  name: string;
  apellido1: string;
  apellido2: string;
  email: string;
  password?: string;
  // añade otros campos que tu backend devuelva, por ejemplo:
  role?: string;
  // avatar?: string;
  avatar?: string;
  avatarUrl?: string;
}
