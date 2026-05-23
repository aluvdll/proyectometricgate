export interface Cliente {
  id: number;
  company_id: number;
  client_number: string;
  active: boolean;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  telefono2?: string | null;
  codigo_postal: string;
  poblacion: string;
  provincia: string;
  dni: string;
  email?: string | null;
}
